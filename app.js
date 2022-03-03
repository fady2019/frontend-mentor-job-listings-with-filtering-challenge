(function () {
  'use strict';

  const jobsContainer = document.querySelector('.jobs-container');
  const filtersContainer = document.querySelector(
    '.filters-container .filters'
  );
  const filterClearBtn = document.querySelector('.filters-container .clear a');
  let JOBS = [];
  let filtersArray = [];

  const getJobsData = async () => {
    const request = new Request('./data.json');
    const response = await fetch(request);
    const dataAsString = await response.text();

    return JSON.parse(dataAsString);
  };

  const getRequirementEle = (...requirements) => {
    let reqsContainer = '';

    requirements.forEach(req => {
      reqsContainer += `<button class="req" data-req="${req}">${req}</button>`;
    });

    return reqsContainer;
  };

  const createJobCard = jobInfo => {
    const jobCardAsString = `
    <div id="${jobInfo.id}" class="job ${jobInfo.featured && 'featured'}">
        <div class="job-main-info">
            <div class="logo">
                <img src="${jobInfo.logo}" alt="logo" />
            </div>

            <div class="info">
                <div class="header">
                <span class="company">${jobInfo.company}</span>
                
                ${
                  jobInfo.new === true
                    ? '<span class="tag new">new!</span>'
                    : ''
                }

                ${
                  jobInfo.featured === true
                    ? '<span class="tag featured">featured</span>'
                    : ''
                }
                </div>

                <div class="job-position">
                <span>${jobInfo.position}</span>
                </div>

                <div class="status-info">
                <span>${jobInfo.postedAt}</span>
                <span>${jobInfo.contract}</span>
                <span>${jobInfo.location}</span>
                </div>
            </div>
        </div>

        <div class="job-requirements">
        ${getRequirementEle(jobInfo.role)}
        ${getRequirementEle(jobInfo.level)}
        ${getRequirementEle(...jobInfo.tools)}
        ${getRequirementEle(...jobInfo.languages)}
        </div>
    </div>
    `;

    return new DOMParser()
      .parseFromString(jobCardAsString, 'text/html')
      .querySelector('.job');
  };

  const createFilterEle = filter => {
    const filterEleAsString = `
    <div class="filter">
      <span id="${filter.id}" class="filter-name">${filter.name}</span>

      <button class="remove-btn" data-filter-id="${filter.id}">
        <img src="./images/icon-remove.svg" alt="" />
      </button>
    </div>
  `;

    return new DOMParser()
      .parseFromString(filterEleAsString, 'text/html')
      .querySelector('.filter');
  };

  const displayJobs = jobs => {
    jobsContainer.innerHTML = '';

    jobs.forEach(jobInfo => jobsContainer.appendChild(createJobCard(jobInfo)));

    jobsContainer.querySelectorAll('.req').forEach(req => {
      req.addEventListener('click', selectFilterHandler);
    });
  };

  const displayFilters = () => {
    filtersContainer.innerHTML = '';

    filtersArray.forEach(filter =>
      filtersContainer.appendChild(createFilterEle(filter))
    );

    filtersContainer.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () =>
        removeFilterHandler(btn.getAttribute('data-filter-id'))
      );
    });

    filtersContainer.parentNode.style =
      filtersArray.length > 0 ? 'visibility: visible' : '';
  };

  const filterJobsHandler = () => {
    const filteredJobs = JOBS.filter(job => {
      const jobReqs = [job.role, job.level, ...job.tools, ...job.languages];

      return filtersArray.every(filter => jobReqs.includes(filter.name));
    });

    displayJobs(filteredJobs);
    displayFilters();
  };

  const selectFilterHandler = event => {
    event.preventDefault();

    const filter = event.target.getAttribute('data-req');

    const isFilterExist =
      filtersArray.find(f => {
        return f.name.toLowerCase() === filter.toLowerCase();
      }) !== undefined;

    if (!isFilterExist) {
      filtersArray.push({
        id: filter.toLowerCase().split(' ').join('-') + '-filter',
        name: filter,
      });

      filterJobsHandler();
    }
  };

  const removeFilterHandler = filterId => {
    const filterIdx = filtersArray.findIndex(filter => filter.id === filterId);

    if (filterIdx > -1) {
      filtersArray.splice(filterIdx, 1);
      filterJobsHandler();
    }
  };

  const clearFiltersHandler = event => {
    event.preventDefault();
    filtersArray = [];
    filterJobsHandler();
  };

  getJobsData().then(data => {
    JOBS = [...data];

    displayJobs(JOBS);

    filterClearBtn.addEventListener('click', clearFiltersHandler);
  });
})();
