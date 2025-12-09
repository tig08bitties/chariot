// TreasureDAOReposAdapter — TreasureDAO Repositories
import { TreasureDAORepos } from '../../../integrations/treasure/treasure-repos.js';

export class TreasureDAOReposAdapter {
  constructor(opts = {}) {
    this.treasureRepos = new TreasureDAORepos(opts);
    this.initialized = false;
  }

  async initialize() {
    const result = await this.treasureRepos.github.initialize();
    this.initialized = result.success;
    return result;
  }

  async getRepo(repoName) {
    return await this.treasureRepos.getRepo(repoName);
  }

  async listAllRepos() {
    return await this.treasureRepos.listAllRepos();
  }

  async getRepoContents(repoName, path) {
    return await this.treasureRepos.getRepoContents(repoName, path);
  }

  async searchRepos(query) {
    return await this.treasureRepos.searchRepos(query);
  }

  async getBridgeworldContracts() {
    return await this.treasureRepos.getBridgeworldContracts();
  }

  async getDocumentation() {
    return await this.treasureRepos.getDocumentation();
  }

  async getSDK() {
    return await this.treasureRepos.getSDK();
  }
}
