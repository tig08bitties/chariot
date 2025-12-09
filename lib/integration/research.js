// ResearchEngineAdapter — Brave Search API Integration
import { ResearchEngine } from '../../../integrations/research/research-engine.js';

export class ResearchEngineAdapter {
  constructor(opts = {}) {
    this.researchEngine = new ResearchEngine(opts);
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    return {
      success: true,
      version: this.researchEngine.version
    };
  }

  async research(topic, options = {}) {
    return await this.researchEngine.deepResearch(topic, options);
  }

  async quickResearch(topic, options = {}) {
    return await this.researchEngine.quickResearch(topic, options);
  }

  async researchBatch(topics, options = {}) {
    return await this.researchEngine.researchBatch(topics, options);
  }

  getHistory(limit = 50) {
    return this.researchEngine.getHistory(limit);
  }

  getKnowledge(topic) {
    return this.researchEngine.getKnowledge(topic);
  }

  searchKnowledge(query) {
    return this.researchEngine.searchKnowledge(query);
  }
}
