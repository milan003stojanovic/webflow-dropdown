
  // Multi-dropdown version (supports many nav dropdowns with the same internal structure)
  // Expected structure per dropdown "group":
  // - .nav-dropdown-trigger
  // - .nav-dropdown-content
  // - optional: .close-nav-dropdown (inside content, or anywhere in the same group)
  //
  // Tip: Wrap each dropdown group in a shared parent like .nav-dropdown (recommended),
  // but this will also work by matching trigger -> nearest parent -> find content within it.

  (function () {
    const DESKTOP_MIN_WIDTH = 992; // >991 is desktop in your original script
    const HOVER_CLOSE_DELAY = 500;

    function isDesktop() {
      return window.innerWidth >= DESKTOP_MIN_WIDTH;
    }

    // Helper: find the "group" container for a trigger
    // Best case: you have a wrapper like .nav-dropdown around each set.
    // Fallback: use closest common Webflow-ish wrappers.
    function getGroupFromTrigger(trigger) {
      return (
        trigger.closest('.nav-dropdown') ||
        trigger.closest('.w-dropdown') ||
        trigger.closest('[data-dropdown-group]') ||
        trigger.parentElement
      );
    }

    function closeAllDropdowns(exceptContentEl) {
      document.querySelectorAll('.nav-dropdown-content.open').forEach((content) => {
        if (exceptContentEl && content === exceptContentEl) return;
        content.classList.remove('open');
        
        // Also remove .open from the corresponding arrow
        const group = content.closest('.nav-dropdown') || content.parentElement;
        const arrow = group?.querySelector('.nav-dropdown-arrow');
        if (arrow) {
          arrow.classList.remove('open');
        }
      });
    }

    function initDropdown(trigger) {
      const group = getGroupFromTrigger(trigger);
      if (!group) return;

      const content = group.querySelector('.nav-dropdown-content');
      if (!content) return;

      const closeBtn = group.querySelector('.close-nav-dropdown');
      const arrow = group.querySelector('.nav-dropdown-arrow');

      let hoverTimeout;

      function showDropdown() {
        if (!isDesktop()) return;
        clearTimeout(hoverTimeout);
        // Optional: only one open at a time on desktop too
        closeAllDropdowns(content);
        content.classList.add('open');
        if (arrow) arrow.classList.add('open');
      }

      function hideDropdownWithDelay() {
        if (!isDesktop()) return;
        hoverTimeout = setTimeout(() => {
          content.classList.remove('open');
          if (arrow) arrow.classList.remove('open');
        }, HOVER_CLOSE_DELAY);
      }

      function handleMobileClick(e) {
        if (isDesktop()) return;

        // Prevent navigating if trigger is an <a> and you want it to behave like a toggle
        // If your trigger should still navigate, remove the next line.
        e.preventDefault();

        const isOpen = content.classList.contains('open');
        if (isOpen) {
          content.classList.remove('open');
          if (arrow) arrow.classList.remove('open');
        } else {
          // On mobile, open this and close others
          closeAllDropdowns(content);
          content.classList.add('open');
          if (arrow) arrow.classList.add('open');
        }
      }

      function closeDropdownMobile() {
        content.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
      }

      // Desktop hover behavior
      trigger.addEventListener('mouseenter', showDropdown);
      trigger.addEventListener('mouseleave', hideDropdownWithDelay);

      content.addEventListener('mouseenter', () => clearTimeout(hoverTimeout));
      content.addEventListener('mouseleave', hideDropdownWithDelay);

      // Mobile click behavior
      trigger.addEventListener('click', handleMobileClick);

      // Optional close button (mobile)
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeDropdownMobile();
        });
      }

      // Close on outside click (mobile only)
      document.addEventListener('click', (e) => {
        if (isDesktop()) return;
        if (group.contains(e.target)) return;
        content.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
      });

      // Optional: close on ESC when focused inside this group
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        content.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
      });
    }

    function initAll() {
      const triggers = document.querySelectorAll('.nav-dropdown-trigger');
      triggers.forEach(initDropdown);
    }

    // Ensure DOM is ready (Webflow pages often load scripts before elements)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }

    // Remove .open if window is resized (matches your original behavior)
    window.addEventListener('resize', () => {
      document.querySelectorAll('.nav-dropdown-content.open').forEach((content) => {
        content.classList.remove('open');
        
        // Also remove .open from arrows
        const group = content.closest('.nav-dropdown') || content.parentElement;
        const arrow = group?.querySelector('.nav-dropdown-arrow');
        if (arrow) {
          arrow.classList.remove('open');
        }
      });
    });
  })();
