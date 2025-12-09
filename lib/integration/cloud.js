// CloudServicesAdapter — Google Cloud, GitHub, Replit, Coder, Cloudbots
import { GoogleCloudIntegration } from '../../../integrations/cloud/gcloud.js';
import { GitHubIntegration } from '../../../integrations/cloud/github.js';
import { ReplitIntegration } from '../../../integrations/cloud/replit.js';
import { CoderIntegration } from '../../../integrations/cloud/coder.js';
import { CloudbotsIntegration } from '../../../integrations/cloud/cloudbots.js';
import { CredentialManager } from '../../../integrations/credentials/credential-manager.js';

export class CloudServicesAdapter {
  constructor(opts = {}) {
    this.credentialManager = new CredentialManager(opts);
    
    this.gcloud = new GoogleCloudIntegration({
      project: opts.gcloudProject,
      credentials: opts.gcloudCredentials
    });
    
    this.github = new GitHubIntegration({
      token: opts.githubToken
    });
    
    this.replit = new ReplitIntegration({
      token: opts.replitToken,
      dbUrl: opts.replitDbUrl
    });
    
    this.coder = new CoderIntegration({
      token: opts.coderToken,
      url: opts.coderUrl
    });
    
    this.cloudbots = new CloudbotsIntegration({
      token: opts.cloudbotsToken,
      apiBase: opts.cloudbotsApiBase
    });
    
    this.initialized = false;
  }

  async initialize() {
    // Load credentials first
    await this.credentialManager.loadAll();
    
    // Initialize services with credentials
    const gcloudCreds = this.credentialManager.getGCloud();
    if (gcloudCreds) {
      this.gcloud.project = gcloudCreds.project || gcloudCreds.project_id;
      this.gcloud.credentials = gcloudCreds.credentials || gcloudCreds.path;
    }
    
    const githubToken = this.credentialManager.getGitHub();
    if (githubToken) {
      this.github.token = githubToken;
    }
    
    const replitCreds = this.credentialManager.getReplit();
    if (replitCreds) {
      this.replit.token = replitCreds.token;
      this.replit.dbUrl = replitCreds.dbUrl;
    }
    
    const coderCreds = this.credentialManager.getCoder();
    if (coderCreds) {
      this.coder.token = coderCreds.token;
      this.coder.url = coderCreds.url;
    }
    
    const cloudbotsCreds = this.credentialManager.getCloudbots();
    if (cloudbotsCreds) {
      this.cloudbots.token = cloudbotsCreds.token;
    }
    
    // Initialize all services
    const results = {
      gcloud: await this.gcloud.initialize(),
      github: await this.github.initialize(),
      replit: await this.replit.initialize(),
      coder: await this.coder.initialize(),
      cloudbots: await this.cloudbots.initialize()
    };
    
    this.initialized = true;
    
    return {
      success: true,
      services: results,
      credentials: this.credentialManager.getStatus()
    };
  }

  getCredentialManager() {
    return this.credentialManager;
  }

  getGCloud() {
    return this.gcloud;
  }

  getGitHub() {
    return this.github;
  }

  getReplit() {
    return this.replit;
  }

  getCoder() {
    return this.coder;
  }

  getCloudbots() {
    return this.cloudbots;
  }
}
