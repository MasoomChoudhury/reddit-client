export const getSubredditPosts = async (subreddit) => {
  const response = await fetch(`/api${subreddit}.json`);
  const json = await response.json();

  return json.data.children.map((post) => post.data);
};

const subreddits = [
  'r/developersIndia',
  'r/programming',
  'r/learnprogramming',
  'r/coding',
  'r/webdev',
  'r/javascript',
  'r/computerscience',
  'r/reactjs',
  'r/dailyprogrammer',
  'r/sysadmin',
  'r/SideProject',
  'r/gamedev',
  'r/python',
  'r/cscareerquestions',
  'r/devops',
];

export const getSubreddits = async () => {
  return Promise.all(
    subreddits.map(async (subreddit) => {
      const response = await fetch(`/api/${subreddit}/about.json`);
      const json = await response.json();
      return json.data;
    })
  );
};

export const getPostComments = async (permalink) => {
  const response = await fetch(`/api${permalink}.json`);
  const json = await response.json();

  return json[1].data.children.map((subreddit) => subreddit.data);
};
