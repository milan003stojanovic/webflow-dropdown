>
  (function () {
    const DESKTOP_MIN_WIDTH = 992; // >= 992 is desktop (your original was > 991)
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

    function setOpenState(contentEl, arrowEl, shouldOpen) {
      if (shouldOpen) {
        contentEl.classList.add('open');
        if (arrowEl) arrowEl.classList.add('open');
      } else {
        contentEl.classList.remove('open');
        if (arrowEl) arrowEl.classList.remove('open');
      }
    }

    function closeAllDropdowns(exceptContentEl) {
      document.querySelectorAll('.nav-dropdown-content.open').forEach((content) => {
        if (exceptContentEl && content === exceptContentEl) return;

        // Find the arrow inside the same dropdown group and remove .open from it too
        const group = content.closest('.nav-dropdown') || content.closest('.w-dropdown') || content.parentElement;
        const arrow = group ? group.querySelector('.nav-dropdown-arrow') : null;

        setOpenState(content, arrow, false);
      });
    }

    function initDropdown(trigger) {
      const group = getGroupFromTrigger(trigger);
      if (!group) return;

      const content = group.querySelector('.nav-dropdown-content');
      if (!content) return;

      const arrow = group.querySelector('.nav-dropdown-arrow'); // NEW
      const closeBtn = group.querySelector('.close-nav-dropdown');

      let hoverTimeout;

      function openDropdown() {
        setOpenState(content, arrow, true);
      }

      function closeDropdown() {
        setOpenState(content, arrow, false);
      }

      function showDropdownDesktop() {
        if (!isDesktop()) return;
        clearTimeout(hoverTimeout);
        closeAllDropdowns(content);
        openDropdown();
      }

      function hideDropdownWithDelayDesktop() {
        if (!isDesktop()) return;
        hoverTimeout = setTimeout(() => {
          closeDropdown();
        }, HOVER_CLOSE_DELAY);
      }

      function handleMobileClick(e) {
        if (isDesktop()) return;

        // If the trigger contains/overlaps links and you still want navigation, remove this.
        e.preventDefault();

        const isOpen = content.classList.contains('open');
        if (isOpen) {
          closeDropdown();
        } else {
          closeAllDropdowns(content);
          openDropdown();
        }
      }

      // Desktop hover behavior
      trigger.addEventListener('mouseenter', showDropdownDesktop);
      trigger.addEventListener('mouseleave', hideDropdownWithDelayDesktop);

      content.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
      content.addEventListener('mouseleave', hideDropdownWithDelayDesktop);

      // Mobile click behavior
      trigger.addEventListener('click', handleMobileClick);

      // Optional close button
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeDropdown();
        });
      }

      // Close on outside click (mobile only)
      document.addEventListener('click', (e) => {
        if (isDesktop()) return;
        if (group.contains(e.target)) return;
        closeDropdown();
      });

      // Close on ESC
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeDropdown();
      });
    }

    function initAll() {
      const triggers = document.querySelectorAll('.nav-dropdown-trigger');
      triggers.forEach(initDropdown);
    }

    // DOM ready safety
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }

    // Reset on resize (matches your original behavior)
    window.addEventListener('resize', () => {
      document.querySelectorAll('.nav-dropdown-content.open').forEach((content) => {
        const group = content.closest('.nav-dropdown') || content.closest('.w-dropdown') || content.parentElement;
        const arrow = group ? group.querySelector('.nav-dropdown-arrow') : null;
        setOpenState(content, arrow, false);
      });
    });
  })();
