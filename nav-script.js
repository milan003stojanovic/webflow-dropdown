(function () {
    const DESKTOP_MIN_WIDTH = 992;
    const HOVER_CLOSE_DELAY = 500;

    function isDesktop() {
      return window.innerWidth >= DESKTOP_MIN_WIDTH;
    }

    function getGroupFromTrigger(trigger) {
      return (
        trigger.closest('.nav-dropdown') ||
        trigger.closest('.w-dropdown') ||
        trigger.closest('[data-dropdown-group]') ||
        trigger.parentElement
      );
    }

    function getArrow(trigger, group) {
      // Prefer arrow inside trigger (your new structure)
      const arrowInTrigger = trigger.querySelector('.nav-dropdown-arrow');
      if (arrowInTrigger) return arrowInTrigger;
      // Fallback: anywhere in group
      return group ? group.querySelector('.nav-dropdown-arrow') : null;
    }

    function syncArrowToContent(contentEl, arrowEl) {
      if (!arrowEl || !contentEl) return;
      const isOpen = contentEl.classList.contains('open');
      arrowEl.classList.toggle('open', isOpen);
    }

    function setOpenState(contentEl, arrowEl, shouldOpen) {
      if (!contentEl) return;
      contentEl.classList.toggle('open', shouldOpen);
      if (arrowEl) arrowEl.classList.toggle('open', shouldOpen);
    }

    function closeAllDropdowns(exceptContentEl) {
      document.querySelectorAll('.nav-dropdown-content.open').forEach((content) => {
        if (exceptContentEl && content === exceptContentEl) return;

        const group =
          content.closest('.nav-dropdown') ||
          content.closest('.w-dropdown') ||
          content.parentElement;

        // try to find trigger in this group so we can reliably find arrow in trigger
        const trigger = group ? group.querySelector('.nav-dropdown-trigger') : null;
        const arrow = trigger ? getArrow(trigger, group) : (group ? group.querySelector('.nav-dropdown-arrow') : null);

        setOpenState(content, arrow, false);
      });
    }

    function initDropdown(trigger) {
      const group = getGroupFromTrigger(trigger);
      if (!group) return;

      const content = group.querySelector('.nav-dropdown-content');
      if (!content) return;

      const arrow = getArrow(trigger, group);
      const closeBtn = group.querySelector('.close-nav-dropdown');

      let hoverTimeout;

      // 1) Always keep arrow synced to whatever happens to content.open (Webflow interaction, other scripts, etc.)
      syncArrowToContent(content, arrow);
      const observer = new MutationObserver(() => syncArrowToContent(content, arrow));
      observer.observe(content, { attributes: true, attributeFilter: ['class'] });

      function openDropdown() {
        closeAllDropdowns(content);
        setOpenState(content, arrow, true);
      }

      function closeDropdown() {
        setOpenState(content, arrow, false);
      }

      // Desktop hover
      trigger.addEventListener('mouseenter', () => {
        if (!isDesktop()) return;
        clearTimeout(hoverTimeout);
        openDropdown();
      });

      trigger.addEventListener('mouseleave', () => {
        if (!isDesktop()) return;
        hoverTimeout = setTimeout(() => closeDropdown(), HOVER_CLOSE_DELAY);
      });

      content.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
      content.addEventListener('mouseleave', () => {
        if (!isDesktop()) return;
        hoverTimeout = setTimeout(() => closeDropdown(), HOVER_CLOSE_DELAY);
      });

      // Mobile click
      trigger.addEventListener('click', (e) => {
        if (isDesktop()) return;

        // If your trigger is a link and should navigate, remove the next line.
        e.preventDefault();

        const isOpen = content.classList.contains('open');
        if (isOpen) closeDropdown();
        else openDropdown();
      });

      // Close button inside dropdown (mobile)
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeDropdown();
        });
      }

      // Outside click close (mobile only)
      document.addEventListener('click', (e) => {
        if (isDesktop()) return;
        if (group.contains(e.target)) return;
        closeDropdown();
      });

      // ESC close
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeDropdown();
      });
    }

    function initAll() {
      document.querySelectorAll('.nav-dropdown-trigger').forEach(initDropdown);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }

    // Reset on resize
    window.addEventListener('resize', () => {
      document.querySelectorAll('.nav-dropdown-content').forEach((content) => {
        const group =
          content.closest('.nav-dropdown') ||
          content.closest('.w-dropdown') ||
          content.parentElement;

        const trigger = group ? group.querySelector('.nav-dropdown-trigger') : null;
        const arrow = trigger ? trigger.querySelector('.nav-dropdown-arrow') : (group ? group.querySelector('.nav-dropdown-arrow') : null);

        setOpenState(content, arrow, false);
      });
    });
  })();
