import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView – není implementováno v jsdom
Element.prototype.scrollIntoView = () => {};
// Mock HTMLElement.focus – občas chybí v jsdom
if (!HTMLElement.prototype.focus) {
  HTMLElement.prototype.focus = () => {};
}
