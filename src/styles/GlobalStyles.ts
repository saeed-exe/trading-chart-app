import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary-color: #2962ff;
    --secondary-color: #0039cb;
    --background-color: #121212;
    --card-bg-color: #1e1e1e;
    --text-color: #e0e0e0;
    --text-secondary: #9e9e9e;
    --success-color: #4caf50;
    --danger-color: #f44336;
    --border-color: #333333;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.5;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }
`;