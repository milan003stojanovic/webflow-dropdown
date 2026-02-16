

  (function () {
    const DESKTOP_MIN_WIDTH = 992; // >991 is desktop
    const HOVER_CLOSE_DELAY = 500;
    const PARENT_CLOSE_DELAY = 500; // 0.5 seconds delay for .nav-dropdown

    function isDesktop() {
      return window.innerWidth >= DESKTOP_MIN_WIDTH;
    }

    // Move dropdown content based on screen size
    function repositionDropdownContent() {
      const dropdownsWrapper = document.querySelector('.dropdowns-wrapper');
      
      if (!dropdownsWrapper) {
        console.warn('No .dropdowns-wrapper found');
        return;
      }

      const allDropdownContent = document.querySelectorAll('[nav-dropdown-content]');

      if (isDesktop()) {
        // Desktop: Move all content back to .dropdowns-wrapper
        allDropdownContent.forEach((content) => {
          if (!dropdownsWrapper.contains(content)) {
            dropdownsWrapper.appendChild(content);
          }
        });
      } else {
        // Mobile: Move each content to its matching wrapper
        allDropdownContent.forEach((content) => {
          const contentValue = content.getAttribute('nav-dropdown-content');
          const targetWrapper = document.querySelector(`[nav-dropdown-wrapper="${contentValue}"]`);
          
          if (targetWrapper && !targetWrapper.contains(content)) {
            targetWrapper.appendChild(content);
          }
        });
      }
    }

    // Helper: find the "group" container for a trigger
    function getGroupFromTrigger(trigger) {
      return (
        trigger.closest('.nav-dropdown') ||
        trigger.closest('.w-dropdown') ||
        trigger.closest('[data-dropdown-group]') ||
        trigger.parentElement
      );
    }

    function closeAllDropdowns(exceptContentEl) {
      document.querySelectorAll('[nav-dropdown-content].open').forEach((content) => {
        if (exceptContentEl && content === exceptContentEl) return;
        content.classList.remove('open');
        
        // Also remove .open from the corresponding arrow and parent
        const contentValue = content.getAttribute('nav-dropdown-content');
        const trigger = document.querySelector(`[nav-dropdown-trigger="${contentValue}"]`);
        
        if (trigger) {
          const group = getGroupFromTrigger(trigger);
          const arrow = group?.querySelector('.nav-dropdown-arrow');
          
          if (arrow) {
            arrow.classList.remove('open');
          }
          if (group && group.classList.contains('nav-dropdown')) {
            setTimeout(() => {
              group.classList.remove('open');
            }, PARENT_CLOSE_DELAY);
          }
        }
      });
    }

    function initDropdown(trigger) {
      const triggerValue = trigger.getAttribute('nav-dropdown-trigger');
      const content = document.querySelector(`[nav-dropdown-content="${triggerValue}"]`);
      
      if (!content) {
        console.warn('No matching content found for trigger:', triggerValue);
        return;
      }

      const group = getGroupFromTrigger(trigger);
      if (!group) return;

      const arrow = group.querySelector('.nav-dropdown-arrow');
      
      // Find close button - it could be inside the content
      const closeBtn = content.querySelector('.close-nav-dropdown');

      let hoverTimeout;

      function showDropdown() {
        if (!isDesktop()) return;
        clearTimeout(hoverTimeout);
        closeAllDropdowns(content);
        content.classList.add('open');
        if (arrow) arrow.classList.add('open');
        if (group.classList.contains('nav-dropdown')) {
          group.classList.add('open');
        }
      }

      function hideDropdownWithDelay() {
        if (!isDesktop()) return;
        hoverTimeout = setTimeout(() => {
          content.classList.remove('open');
          if (arrow) arrow.classList.remove('open');
          if (group.classList.contains('nav-dropdown')) {
            setTimeout(() => {
              group.classList.remove('open');
            }, PARENT_CLOSE_DELAY);
          }
        }, HOVER_CLOSE_DELAY);
      }

      function handleMobileClick(e) {
        if (isDesktop()) return;

        e.preventDefault();

        const isOpen = content.classList.contains('open');
        if (isOpen) {
          content.classList.remove('open');
          if (arrow) arrow.classList.remove('open');
          if (group.classList.contains('nav-dropdown')) {
            setTimeout(() => {
              group.classList.remove('open');
            }, PARENT_CLOSE_DELAY);
          }
        } else {
          closeAllDropdowns(content);
          content.classList.add('open');
          if (arrow) arrow.classList.add('open');
          if (group.classList.contains('nav-dropdown')) {
            group.classList.add('open');
          }
        }
      }

      function closeDropdownMobile() {
        content.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
        if (group.classList.contains('nav-dropdown')) {
          setTimeout(() => {
            group.classList.remove('open');
          }, PARENT_CLOSE_DELAY);
        }
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
        if (group.contains(e.target) || content.contains(e.target)) return;
        content.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
        if (group.classList.contains('nav-dropdown')) {
          setTimeout(() => {
            group.classList.remove('open');
          }, PARENT_CLOSE_DELAY);
        }
      });

      // Optional: close on ESC
      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        content.classList.remove('open');
        if (arrow) arrow.classList.remove('open');
        if (group.classList.contains('nav-dropdown')) {
          setTimeout(() => {
            group.classList.remove('open');
          }, PARENT_CLOSE_DELAY);
        }
      });
    }

    function initAll() {
      // First, reposition content based on screen size
      repositionDropdownContent();
      
      // Then initialize dropdowns
      const triggers = document.querySelectorAll('[nav-dropdown-trigger]');
      triggers.forEach(initDropdown);
    }

    // Ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // Close all dropdowns on resize
      document.querySelectorAll('[nav-dropdown-content].open').forEach((content) => {
        content.classList.remove('open');
        
        const contentValue = content.getAttribute('nav-dropdown-content');
        const trigger = document.querySelector(`[nav-dropdown-trigger="${contentValue}"]`);
        
        if (trigger) {
          const group = getGroupFromTrigger(trigger);
          const arrow = group?.querySelector('.nav-dropdown-arrow');
          
          if (arrow) {
            arrow.classList.remove('open');
          }
          if (group && group.classList.contains('nav-dropdown')) {
            setTimeout(() => {
              group.classList.remove('open');
            }, PARENT_CLOSE_DELAY);
          }
        }
      });

      // Debounce the repositioning to avoid excessive DOM manipulation
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        repositionDropdownContent();
      }, 100);
    });
  })();
