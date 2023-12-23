import { GithubOutlined } from '@ant-design/icons';
import '@umijs/max';

export type SiderTheme = 'light' | 'dark';

export const GitHubLink = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://github.com/Sami116/beanbi-frontend');
      }}
    >
      <GithubOutlined />
    </div>
  );
};
