function parseGitHubProfile(profile) {
  return {
    login: profile.login || 'unknown',
    name: profile.name || profile.login || 'Unknown',
    bio: profile.bio || null,
    location: profile.location || null,
    company: profile.company || null,
    blog: profile.blog || null,
    publicRepos: profile.public_repos != null ? profile.public_repos : 0,
    followers: profile.followers != null ? profile.followers : 0,
    following: profile.following != null ? profile.following : 0,
    htmlUrl: profile.html_url || null,
    createdAt: profile.created_at || null,
  };
}

function tallyLanguages(repos) {
  const tally = {};
  (repos || []).forEach(repo => {
    if (repo.language) tally[repo.language] = (tally[repo.language] || 0) + 1;
  });
  return Object.keys(tally)
    .map(k => ({ language: k, count: tally[k] }))
    .sort((a, b) => b.count - a.count);
}

function summarizeRepos(repos) {
  return (repos || [])
    .slice()
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 4)
    .map(r => ({
      name: r.name || r.full_name || '?',
      description: r.description || null,
      language: r.language || null,
      stars: r.stargazers_count != null ? r.stargazers_count : 0,
    }));
}

async function loadSampleGitHub() {
  try {
    const res = await fetch('/data/sample-github-analysis.json');
    if (!res.ok) throw new Error('sample fetch failed');
    const data = await res.json();
    return {
      source: 'sample',
      profile: parseGitHubProfile(data.profile),
      languages: tallyLanguages(data.repos),
      repos: summarizeRepos(data.repos),
    };
  } catch {
    return {
      source: 'sample',
      profile: {
        login: 'octocat', name: 'The Octocat', bio: 'Curious cat.',
        location: null, company: null, blog: null,
        publicRepos: 8, followers: 20124, following: 9, htmlUrl: null, createdAt: null,
      },
      languages: [
        { language: 'TypeScript', count: 3 },
        { language: 'JavaScript', count: 1 },
        { language: 'Python', count: 1 },
        { language: 'Go', count: 1 },
        { language: 'Rust', count: 1 },
      ],
      repos: [],
    };
  }
}

export async function fetchGitHub(username) {
  const user = String(username || '').trim().replace(/^@/, '');
  if (!user) return loadSampleGitHub();
  try {
    const profileRes = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`);
    if (!profileRes.ok) throw new Error(`GitHub profile status ${profileRes.status}`);
    const profile = await profileRes.json();
    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`);
    const repos = reposRes.ok ? await reposRes.json() : [];
    return {
      source: 'live',
      profile: parseGitHubProfile(profile),
      languages: tallyLanguages(repos),
      repos: summarizeRepos(repos),
    };
  } catch {
    return loadSampleGitHub();
  }
}
