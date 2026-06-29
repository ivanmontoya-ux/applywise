const viewButtons = document.querySelectorAll("[data-view]");
const views = document.querySelectorAll(".view");
const sideNavItems = document.querySelectorAll(".nav-item");
const mobileNavItems = document.querySelectorAll(".mobile-nav-item");

function showView(viewName) {
  views.forEach((view) => {
    view.classList.toggle("is-visible", view.id === `view-${viewName}`);
  });

  sideNavItems.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });

  mobileNavItems.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

const jobSearch = document.getElementById("job-search");
const industryFilter = document.getElementById("industry-filter");
const workFilter = document.getElementById("work-filter");
const clearFilters = document.getElementById("clear-filters");
const jobCards = document.querySelectorAll(".job-card");

function filterJobs() {
  const query = jobSearch.value.trim().toLowerCase();
  const industry = industryFilter.value;
  const work = workFilter.value;

  jobCards.forEach((card) => {
    const matchesQuery = !query || card.dataset.search.includes(query);
    const matchesIndustry = industry === "all" || card.dataset.industry === industry;
    const matchesWork = work === "all" || card.dataset.work === work;
    card.hidden = !(matchesQuery && matchesIndustry && matchesWork);
  });
}

[jobSearch, industryFilter, workFilter].forEach((control) => {
  control?.addEventListener("input", filterJobs);
});

clearFilters?.addEventListener("click", () => {
  jobSearch.value = "";
  industryFilter.value = "all";
  workFilter.value = "all";
  filterJobs();
});

document.querySelectorAll(".save-job").forEach((button) => {
  button.addEventListener("click", () => {
    button.textContent = "Job saved";
    button.disabled = true;
    button.classList.add("is-saved");
    window.setTimeout(() => {
      showView("tracker");
    }, 500);
  });
});

const addJobForm = document.getElementById("add-job-form");
const addJobFeedback = document.getElementById("add-job-feedback");

addJobForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  addJobFeedback.textContent = "Job saved to Tracker.";
  addJobFeedback.className = "form-feedback is-success";
  addJobForm.reset();
});

const statusSegments = document.querySelectorAll("[data-status-filter]");
const trackerColumns = document.querySelectorAll(".tracker-column");
const applicationCards = document.querySelectorAll(".application-card");

statusSegments.forEach((segment) => {
  segment.addEventListener("click", () => {
    const status = segment.dataset.statusFilter;

    statusSegments.forEach((item) => item.classList.remove("is-active"));
    segment.classList.add("is-active");

    trackerColumns.forEach((column) => {
      const hasVisibleCard = Array.from(column.querySelectorAll(".application-card")).some((card) => {
        return status === "all" || card.dataset.status === status;
      });
      column.classList.toggle("is-filter-hidden", status !== "all" && !hasVisibleCard);
    });

    applicationCards.forEach((card) => {
      card.classList.toggle("is-filter-hidden", status !== "all" && card.dataset.status !== status);
    });
  });
});

const detailStatus = document.getElementById("detail-status");
const detailBadge = document.getElementById("detail-status-badge");
const statusFeedback = document.getElementById("status-feedback");

detailStatus?.addEventListener("change", () => {
  detailBadge.textContent = detailStatus.value;
  statusFeedback.textContent = `Latest update: application moved to ${detailStatus.value}.`;
});

const coachModes = {
  fit: {
    label: "Check job fit",
    title: "Your evidence is strongest for research and structured analysis.",
    copy: "The job description asks for client communication, analysis, and structured problem solving. Your CV supports the analysis points, but the client communication point needs a more specific example.",
  },
  cv: {
    label: "Improve CV",
    title: "Your CV needs more evidence for this requirement.",
    copy: "Add a concise bullet about preparing stakeholder updates. Keep it truthful and tie it to work you can explain in an interview.",
  },
  letter: {
    label: "Draft cover letter",
    title: "The cover letter can be drafted after one evidence gap is resolved.",
    copy: "Add one confirmed example for client communication before generating a role-specific draft for BCG Graduate Consultant.",
  },
  next: {
    label: "What should I do next?",
    title: "Add evidence, then finish the cover letter draft.",
    copy: "Your next useful step is to update the CV text with one stakeholder communication example, then review the generated cover letter before saving it.",
  },
};

const coachModeLabel = document.getElementById("coach-mode-label");
const coachOutputTitle = document.getElementById("coach-output-title");
const coachOutputCopy = document.getElementById("coach-output-copy");

document.querySelectorAll("[data-coach-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    const mode = coachModes[button.dataset.coachMode];
    document.querySelectorAll("[data-coach-mode]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    coachModeLabel.textContent = mode.label;
    coachOutputTitle.textContent = mode.title;
    coachOutputCopy.textContent = mode.copy;
  });
});

document.querySelectorAll(".complete-reminder").forEach((button) => {
  button.addEventListener("click", () => {
    const reminder = button.closest(".reminder-row");
    reminder.classList.add("is-complete");
    button.textContent = "Completed";
    button.disabled = true;
  });
});

const waitlistForm = document.getElementById("waitlist-form");
const waitlistEmail = document.getElementById("waitlist-email");
const waitlistFeedback = document.getElementById("waitlist-feedback");
const submittedEmails = new Set();

waitlistForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = waitlistEmail.value.trim().toLowerCase();

  if (!waitlistEmail.checkValidity()) {
    waitlistFeedback.textContent = "Enter a valid email to join the waitlist.";
    waitlistFeedback.className = "form-feedback is-error";
    return;
  }

  if (submittedEmails.has(email)) {
    waitlistFeedback.textContent = "This email is already on the waitlist.";
    waitlistFeedback.className = "form-feedback is-error";
    return;
  }

  submittedEmails.add(email);
  waitlistFeedback.textContent = "You are on the waitlist. We will send early access updates to this email.";
  waitlistFeedback.className = "form-feedback is-success";
  waitlistForm.reset();
});
