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
const waitlistName = document.getElementById("waitlist-name");
const waitlistEmail = document.getElementById("waitlist-email");
const waitlistLocation = document.getElementById("waitlist-location");
const waitlistRole = document.getElementById("waitlist-role");
const waitlistNeed = document.getElementById("waitlist-need");
const waitlistFeedback = document.getElementById("waitlist-feedback");
const waitlistCount = document.getElementById("waitlist-count");
const waitlistPrimaryRole = document.getElementById("waitlist-primary-role");
const waitlistLatestDate = document.getElementById("waitlist-latest-date");
const waitlistSignups = document.getElementById("waitlist-signups");
const clearWaitlist = document.getElementById("clear-waitlist");
const syncWaitlist = document.getElementById("sync-waitlist");
const waitlistStorageKey = "applywise-waitlist-demo";
const supabaseConfig = window.APPLYWISE_SUPABASE || {};
const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.publishableKey);

function normalizeSupabaseUrl(url) {
  return url.replace(/\/$/, "");
}

function loadWaitlistEntries() {
  try {
    return JSON.parse(localStorage.getItem(waitlistStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveWaitlistEntries(entries) {
  localStorage.setItem(waitlistStorageKey, JSON.stringify(entries));
}

async function sendWaitlistEntryToSupabase(entry) {
  if (!isSupabaseConfigured) {
    return { skipped: true };
  }

  const response = await fetch(`${normalizeSupabaseUrl(supabaseConfig.url)}/rest/v1/waitlist_signups`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.publishableKey,
      Authorization: `Bearer ${supabaseConfig.publishableKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      email: entry.email,
      full_name: entry.name,
      location: entry.location || null,
      target_role: entry.role || null,
      strongest_need: entry.need || null,
      source: "ui-prototype",
      metadata: {
        localPrototype: true,
      },
    }),
  });

  if (response.ok) {
    return { saved: true };
  }

  const message = await response.text();
  if (response.status === 409 || message.includes("duplicate key")) {
    return { duplicate: true };
  }

  throw new Error(message || `Supabase request failed with ${response.status}`);
}

function upsertLocalWaitlistEntry(entry) {
  const entries = loadWaitlistEntries();
  const existingIndex = entries.findIndex((item) => item.email === entry.email);

  if (existingIndex >= 0) {
    entries[existingIndex] = {
      ...entries[existingIndex],
      ...entry,
      createdAt: entries[existingIndex].createdAt || entry.createdAt,
    };
  } else {
    entries.unshift(entry);
  }

  saveWaitlistEntries(entries);
}

function formatSignupDate(isoDate) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
  }).format(new Date(isoDate));
}

function getPrimaryRole(entries) {
  if (entries.length === 0) {
    return "None";
  }

  const roleCounts = entries.reduce((counts, entry) => {
    counts[entry.role] = (counts[entry.role] || 0) + 1;
    return counts;
  }, {});

  return Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0][0];
}

function renderWaitlist() {
  if (!waitlistSignups) {
    return;
  }

  const entries = loadWaitlistEntries();
  waitlistCount.textContent = String(entries.length);
  waitlistPrimaryRole.textContent = getPrimaryRole(entries);
  waitlistLatestDate.textContent = entries[0] ? formatSignupDate(entries[0].createdAt) : "No entries";

  waitlistSignups.replaceChildren();

  if (entries.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "waitlist-empty";
    emptyState.textContent = "No waitlist entries yet. Add one from the form above.";
    waitlistSignups.append(emptyState);
    return;
  }

  entries.slice(0, 5).forEach((entry) => {
    const row = document.createElement("article");
    row.className = "waitlist-row";

    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = entry.name;
    const details = document.createElement("p");
    const location = entry.location || "Location not added";
    const need = entry.need ? ` - ${entry.need}` : "";
    details.textContent = `${entry.email} - ${location} - ${entry.role}${need}`;
    content.append(title, details);

    const badge = document.createElement("span");
    badge.className = "status-badge";
    badge.textContent = formatSignupDate(entry.createdAt);

    row.append(content, badge);
    waitlistSignups.append(row);
  });
}

waitlistForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = waitlistName.value.trim();
  const email = waitlistEmail.value.trim().toLowerCase();
  const location = waitlistLocation.value.trim();
  const role = waitlistRole.value;
  const need = waitlistNeed.value.trim();
  const submitButton = waitlistForm.querySelector("[type='submit']");

  if (!waitlistForm.checkValidity()) {
    waitlistFeedback.textContent = "Add your name, a valid email, and consent to join the waitlist.";
    waitlistFeedback.className = "form-feedback is-error";
    return;
  }

  const entry = {
    name,
    email,
    location,
    role,
    need,
    createdAt: new Date().toISOString(),
  };

  submitButton.disabled = true;
  waitlistFeedback.textContent = isSupabaseConfigured ? "Submitting to Supabase..." : "Saving locally. Supabase is not configured.";
  waitlistFeedback.className = "form-feedback";

  try {
    const result = await sendWaitlistEntryToSupabase(entry);

    if (result.duplicate) {
      waitlistFeedback.textContent = "This email is already on the Supabase waitlist.";
      waitlistFeedback.className = "form-feedback is-error";
      return;
    }

    upsertLocalWaitlistEntry(entry);
    renderWaitlist();
    waitlistFeedback.textContent = result.skipped
      ? "Saved locally only. Add Supabase config to send entries to the database."
      : "You are on the Supabase waitlist.";
    waitlistFeedback.className = "form-feedback is-success";
    waitlistForm.reset();
  } catch (error) {
    waitlistFeedback.textContent = `Supabase signup failed: ${error.message}`;
    waitlistFeedback.className = "form-feedback is-error";
  } finally {
    submitButton.disabled = false;
  }
});

clearWaitlist?.addEventListener("click", () => {
  saveWaitlistEntries([]);
  renderWaitlist();
  waitlistFeedback.textContent = "Demo waitlist entries cleared.";
  waitlistFeedback.className = "form-feedback";
});

syncWaitlist?.addEventListener("click", async () => {
  if (!isSupabaseConfigured) {
    waitlistFeedback.textContent = "Supabase is not configured for this prototype.";
    waitlistFeedback.className = "form-feedback is-error";
    return;
  }

  const entries = loadWaitlistEntries();
  if (entries.length === 0) {
    waitlistFeedback.textContent = "There are no local waitlist entries to sync.";
    waitlistFeedback.className = "form-feedback";
    return;
  }

  syncWaitlist.disabled = true;
  waitlistFeedback.textContent = "Syncing local entries to Supabase...";
  waitlistFeedback.className = "form-feedback";

  try {
    let synced = 0;
    let duplicates = 0;

    for (const entry of entries) {
      const result = await sendWaitlistEntryToSupabase(entry);
      if (result.saved) synced += 1;
      if (result.duplicate) duplicates += 1;
    }

    waitlistFeedback.textContent = `Sync complete. ${synced} added, ${duplicates} already existed.`;
    waitlistFeedback.className = "form-feedback is-success";
  } catch (error) {
    waitlistFeedback.textContent = `Sync failed: ${error.message}`;
    waitlistFeedback.className = "form-feedback is-error";
  } finally {
    syncWaitlist.disabled = false;
  }
});

renderWaitlist();
