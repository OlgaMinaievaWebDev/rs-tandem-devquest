import './styles/main.css';

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  root.innerHTML = `
    <h1>DevQuest</h1>
    <p>Project initialized successfully 🚀</p>
  `;
}
