(() => {
  "use strict";
  // ONE DIMENSION, ONE CHOICE. The page used to filter by four taxonomies at once -- skills, capability
  // areas, technologies and organizations -- with a set of values per taxonomy, a tab strip over a shared
  // panel, a result counter, a clear button and a no-result state. Thirty-eight values across four
  // dimensions for eleven projects, fifteen of which returned a single project, and no value was visible
  // until a category was opened.
  //
  // What is left is the one dimension the rest of the site already publishes: the capability areas, which
  // are the Home hero pills and the Expertise tiles. Five values, always visible, one choice at a time --
  // so a second click replaces the first instead of narrowing it, and there is no combination to hold in
  // mind. Every area covers at least two published projects, so no choice can empty the list, which is why
  // the counter, the clear control and the no-result message are all gone rather than hidden: there is
  // nothing left for them to report.
  const root = document.querySelector("[data-project-filters]");
  if (!root) return;
  const cards = Array.from(document.querySelectorAll("[data-project-card]"));
  const buttons = Array.from(root.querySelectorAll("[data-filter-dimension][data-filter-value]"));
  const allowed = new Set(buttons.map((button) => button.dataset.filterValue));
  const safeValue = (value) => typeof value === "string" && value.length <= 64 && allowed.has(value);
  // `""` means "every area". It is a value and not a null, so the rest of this file reads the same way
  // whatever is chosen.
  let chosen = "";

  const readQuery = () => {
    const value = new URLSearchParams(window.location.search).get("domain");
    chosen = safeValue(value) ? value : "";
  };
  const writeQuery = () => {
    const fragment = /^#[a-z0-9][a-z0-9-]{0,99}$/.test(window.location.hash) ? window.location.hash : "";
    const query = chosen ? `?domain=${encodeURIComponent(chosen)}` : "";
    history.replaceState(null, "", window.location.pathname + query + fragment);
  };
  const areasOf = (card) => new Set((card.dataset.domains || "").split(" ").filter(Boolean));
  // A card is shown when no area is chosen, or when the chosen area is one the project belongs to. Every
  // value on screen is a value that returns at least one project, so the result is never empty.
  const matches = (card) => !chosen || areasOf(card).has(chosen);
  const render = (synchronize) => {
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filterValue === chosen));
    });
    cards.forEach((card) => {
      card.hidden = !matches(card);
    });
    if (synchronize) writeQuery();
  };
  buttons.forEach((button) => button.addEventListener("click", () => {
    const value = button.dataset.filterValue;
    if (!safeValue(value)) return;
    // Clicking the chosen area unchooses it, so the list is never a state the reader cannot leave.
    chosen = chosen === value ? "" : value;
    render(true);
  }));
  window.addEventListener("popstate", () => {
    readQuery();
    render(false);
  });
  readQuery();
  root.hidden = false;
  render(false);
})();
