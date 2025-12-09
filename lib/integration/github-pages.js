// GitHubPagesAdapter — GitHub Pages Deployment
import { GitHubPagesDeployment } from '../../../integrations/github/github-pages.js';

export class GitHubPagesAdapter {
  constructor(opts = {}) {
    this.githubPages = new GitHubPagesDeployment(opts);
    this.initialized = false;
  }

  async initialize() {
    const result = await this.githubPages.github.initialize();
    this.initialized = result.success;
    return result;
  }

  async initializePages() {
    return await this.githubPages.initializePages();
  }

  async getPagesStatus() {
    return await this.githubPages.getPagesStatus();
  }

  async updatePagesSource(branch, path) {
    return await this.githubPages.updatePagesSource(branch, path);
  }

  async deployViaGit(distDir) {
    return await this.githubPages.deployViaGit(distDir);
  }

  async createDeploymentWorkflow() {
    return await this.githubPages.createDeploymentWorkflow();
  }
}
