// figure_announcer.js
// This module handles announcing salsa figures via text-to-speech and displaying the figure name

// Function to announce the name of the salsa figure
export const announceFigure = (figure) => {
    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(figure);
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('Text-to-speech not supported in this browser.');
    }
};

// Function to display the salsa figure on the screen
export const displayFigure = (figure, elementId = 'figure-display') => {
    const displayElement = document.getElementById(elementId);
    if (displayElement) {
        displayElement.textContent = figure;
    } else {
        console.warn(`Element with ID '${elementId}' not found.`);
    }
};

// Combined function to both display and announce the figure
export const announceAndDisplayFigure = (figure) => {
    displayFigure(figure);   // Display the figure
    announceFigure(figure);  // Announce the figure
};