// Accessibility utilities for the Dam Aji Tournament System

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management
export const focusElement = (selector: string, delay: number = 0): void => {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, delay);
};

// Trap focus within a container
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Find close button or trigger blur
      const closeButton = container.querySelector('[data-close]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  container.addEventListener('keydown', handleEscapeKey);

  // Focus first element
  if (firstElement) {
    firstElement.focus();
  }

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
    container.removeEventListener('keydown', handleEscapeKey);
  };
};

// Generate unique IDs for form elements
let idCounter = 0;
export const generateId = (prefix: string = 'element'): string => {
  idCounter++;
  return `${prefix}-${idCounter}`;
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    // Simple luminance calculation for hex colors
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// Check if color combination meets WCAG standards
export const meetsWCAGStandards = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};

// Keyboard navigation helpers
export const handleArrowNavigation = (
  e: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (newIndex: number) => void
): void => {
  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      newIndex = (currentIndex + 1) % items.length;
      e.preventDefault();
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      e.preventDefault();
      break;
    case 'Home':
      newIndex = 0;
      e.preventDefault();
      break;
    case 'End':
      newIndex = items.length - 1;
      e.preventDefault();
      break;
    default:
      return;
  }

  onIndexChange(newIndex);
  items[newIndex]?.focus();
};

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// High contrast detection
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Font size preferences
export const getPreferredFontSize = (): 'small' | 'medium' | 'large' => {
  const fontSize = window.getComputedStyle(document.documentElement).fontSize;
  const size = parseInt(fontSize);
  
  if (size >= 20) return 'large';
  if (size >= 16) return 'medium';
  return 'small';
};

// ARIA live region manager
class LiveRegionManager {
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
  }

  private createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = `live-region-${priority}`;
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
    region.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  destroy(): void {
    this.politeRegion.remove();
    this.assertiveRegion.remove();
  }
}

export const liveRegionManager = new LiveRegionManager();

// Skip link functionality
export const createSkipLink = (targetId: string, text: string): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
};

// Form accessibility helpers
export const associateLabel = (input: HTMLElement, label: HTMLElement): void => {
  const inputId = input.id || generateId('input');
  input.id = inputId;
  label.setAttribute('for', inputId);
};

export const addErrorDescription = (input: HTMLElement, errorElement: HTMLElement): void => {
  const errorId = errorElement.id || generateId('error');
  errorElement.id = errorId;
  
  const describedBy = input.getAttribute('aria-describedby');
  const newDescribedBy = describedBy ? `${describedBy} ${errorId}` : errorId;
  input.setAttribute('aria-describedby', newDescribedBy);
  input.setAttribute('aria-invalid', 'true');
};

export const removeErrorDescription = (input: HTMLElement, errorId: string): void => {
  const describedBy = input.getAttribute('aria-describedby');
  if (describedBy) {
    const newDescribedBy = describedBy.replace(errorId, '').trim();
    if (newDescribedBy) {
      input.setAttribute('aria-describedby', newDescribedBy);
    } else {
      input.removeAttribute('aria-describedby');
    }
  }
  input.setAttribute('aria-invalid', 'false');
};

// Table accessibility
export const makeTableAccessible = (table: HTMLTableElement): void => {
  // Add table caption if missing
  if (!table.caption) {
    const caption = table.createCaption();
    caption.textContent = 'Data table';
    caption.className = 'sr-only';
  }

  // Add scope attributes to headers
  const headers = table.querySelectorAll('th');
  headers.forEach(header => {
    if (!header.getAttribute('scope')) {
      // Determine if it's a column or row header
      const isRowHeader = header.parentElement?.children[0] === header;
      header.setAttribute('scope', isRowHeader ? 'row' : 'col');
    }
  });
};

// Initialize accessibility features
export const initializeAccessibility = (): void => {
  // Add skip links
  const mainContent = document.querySelector('main');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }

  const skipLink = createSkipLink('main-content', 'Langkau ke kandungan utama');
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Set up focus management for modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.querySelector('[role="dialog"]:not([aria-hidden="true"])');
      if (modal) {
        const closeButton = modal.querySelector('[data-close]') as HTMLElement;
        closeButton?.click();
      }
    }
  });

  // Announce page changes
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      liveRegionManager.announce('Halaman telah berubah', 'polite');
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};
