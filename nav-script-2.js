
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
      const desktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
      console.log('isDesktop:', desktop, 'Window width:', window.innerWidth);
      return desktop;
    }

    // Helper: find the "group" container for a trigger
    // Best case: you have a wrapper like .nav-dropdown around each set.
    // Fallback: use closest common Webflow-ish wrappers.
    function getGroupFromTrigger(trigger) {
      const group = (
        trigger.closest('.nav-dropdown') ||
        trigger.closest('.w-dropdown') ||
        trigger.closest('[data-dropdown-group]') ||
        trigger.parentElement
      );
      console.log('getGroupFromTrigger:', group);
      return group;
    }

    function closeAllDropdowns(exceptContentEl) {
      console.log('closeAllDropdowns called, except:', exceptContentEl);
      document.querySelectorAll('.nav-dropdown-content.open').forEach((content) => {
        if (exceptContentEl && content === exceptContentEl) return;
        console.log('Closing dropdown content:', content);
        content.classList.remove('open');
        
        // Also remove .open from the corresponding arrow
        const group = content.closest('.nav-dropdown') || content.parentElement;
        const arrow = group?.querySelector('.nav-dropdown-arrow');
        console.log('Found arrow for closing:', arrow);
        if (arrow) {
          arrow.classList.remove('open');
          console.log('Removed .open from arrow');
        }
      });
    }

    function initDropdown(trigger) {
      console.log('Initializing dropdown for trigger:', trigger);
      const group = getGroupFromTrigger(trigger);
      if (!group) {
        console.warn('No group found for trigger:', trigger);
        return;
      }

      const content = group.querySelector('.nav-dropdown-content');
      if (!content) {
        console.warn('No content found in group:', group);
        return;
      }

      const closeBtn = group.querySelector('.close-nav-dropdown');
      const arrow = group.querySelector('.nav-dropdown-arrow');
      
      console.log('Dropdown elements found:', {
        group,
        content,
        closeBtn,
        arrow
      });

      let hoverTimeout;

      function showDropdown() {
        console.log('showDropdown called, isDesktop:', isDesktop());
        if (!isDesktop()) return;
        clearTimeout(hoverTimeout);
        // Optional: only one open at a time on desktop too
        closeAllDropdowns(content);
        content.classList.add('open');
        console.log('Added .open to content:', content);
        if (arrow) {
          arrow.classList.add('open');
          console.log('Added .open to arrow:', arrow);
        } else {
          console.warn('No arrow found!');
        }
      }

      function hideDropdownWithDelay() {
        console.log('hideDropdownWithDelay called, isDesktop:', isDesktop());
        if (!isDesktop()) return;
        hoverTimeout = setTimeout(() => {
          console.log('Hiding dropdown after delay');
          content.classList.remove('open');
          if (arrow) {
            arrow.classList.remove('open');
            console.log('Removed .open from arrow');
          }
        }, HOVER_CLOSE_DELAY);
      }

      function handleMobileClick(e) {
        console.log('handleMobileClick called, isDesktop:', isDesktop());
        if (isDesktop()) return;

        // Prevent navigating if trigger is an <a> and you want it to behave like a toggle
        // If your trigger should still navigate, remove the next line.
        e.preventDefault();

        const isOpen = content.classList.contains('open');
        console.log('Current state - isOpen:', isOpen);
        if (isOpen) {
          content.classList.remove('open');
          console.log('Removed .open from content (mobile)');
          if (arrow) {
            arrow.classList.remove('open');
            console.log('Removed .open from arrow (mobile)');
          }
        } else {
          // On mobile, open this and close others
          closeAllDropdowns(content);
          content.classList.add('open');
          console.log('Added .open to content (mobile)');
          if (arrow) {
            arrow.classList.add('open');
            console.log('Added .open to arrow (mobile)');
          } else {
            console.warn('No arrow found for mobile click!');
          }
        }
      }

      function closeDropdownMobile() {
        console.log('closeDropdownMobile called');
        content.classList.remove('open');
        if (arrow) {
          arrow.classList.remove('open');
          console.log('Removed .open from arrow (closeDropdownMobile)');
        }
      }

      // Desktop hover behavior
      trigger.addEventListener('mouseenter', showDropdown);
      trigger.addEventListener('mouseleave', hideDropdownWithDelay);

      content.addEventListener('mouseenter', () => {
        console.log('Content mouseenter - clearing timeout');
        clearTimeout(hoverTimeout);
      });
      content.addEventListener('mouseleave', hideDropdownWithDelay);

      // Mobile click behavior
      trigger.addEventListener('click', handleMobileClick);

      // Optional close button (mobile)
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          console.log('Close button clicked');
          e.preventDefault();
          closeDropdownMobile();
        });
      }

      // Close on outside click (mobile only)
      document.addEventListener('click', (e) => {
        if (isDesktop()) return;
        if (group.contains(e.target)) return;
        console.log('Outside click detected (mobile)');
        content.classList.remove('open');
        if (arrow) {
          arrow.classList.remove('open');
          console.log('Removed .open from arrow (outside click)');
        }
      });

      // Optional: close on ESC when focused inside this group
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        console.log('ESC key pressed');
        content.classList.remove('open');
        if (arrow) {
          arrow.classList.remove('open');
          console.log('Removed .open from arrow (ESC)');
        }
      });
    }

    function initAll() {
      console.log('initAll called');
      const triggers = document.querySelectorAll('.nav-dropdown-trigger');
      console.log('Found triggers:', triggers.length, triggers);
      triggers.forEach(initDropdown);
    }

    // Ensure DOM is ready (Webflow pages often load scripts before elements)
    if (document.readyState === 'loading') {
      console.log('DOM still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      console.log('DOM already loaded, initializing now');
      initAll();
    }

    // Remove .open if window is resized (matches your original behavior)
    window.addEventListener('resize', () => {
      console.log('Window resized');
      document.querySelectorAll('.nav-dropdown-content.open').forEach((content) => {
        content.classList.remove('open');
        
        // Also remove .open from arrows
        const group = content.closest('.nav-dropdown') || content.parentElement;
        const arrow = group?.querySelector('.nav-dropdown-arrow');
        console.log('Resize - found arrow:', arrow);
        if (arrow) {
          arrow.classList.remove('open');
          console.log('Removed .open from arrow (resize)');
        }
      });
    });
  })();
