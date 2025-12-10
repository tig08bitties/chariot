/**
 * GitHub GraphQL Node ID Utilities
 * 
 * Uses global node IDs to bridge REST and GraphQL APIs
 * 
 * Reference: https://docs.github.com/en/rest/guides/using-global-node-ids
 */

const { Octokit } = require('@octokit/rest');
const { graphql } = require('@octokit/graphql');

class GitHubNodeIDManager {
  constructor(token) {
    this.rest = new Octokit({ auth: token });
    this.graphql = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  /**
   * Get node_id from REST API
   * @param {string} endpoint - REST API endpoint (e.g., '/user', '/repos/owner/repo')
   * @returns {Promise<string>} - Global node ID
   */
  async getNodeIDFromREST(endpoint) {
    const response = await this.rest.request(`GET ${endpoint}`);
    return response.data.node_id;
  }

  /**
   * Get object type from GraphQL using node ID
   * @param {string} nodeId - Global node ID
   * @returns {Promise<string>} - Object type (e.g., 'User', 'Repository')
   */
  async getNodeType(nodeId) {
    const query = `
      query {
        node(id:"${nodeId}") {
          __typename
        }
      }
    `;
    const result = await this.graphql(query);
    return result.node.__typename;
  }

  /**
   * Direct node lookup in GraphQL
   * @param {string} nodeId - Global node ID
   * @param {string} type - Object type (e.g., 'User', 'Repository')
   * @param {string} fields - GraphQL fields to query
   * @returns {Promise<object>} - Query result
   */
  async lookupNode(nodeId, type, fields) {
    const query = `
      query {
        node(id:"${nodeId}") {
          ... on ${type} {
            ${fields}
          }
        }
      }
    `;
    const result = await this.graphql(query);
    return result.node;
  }

  /**
   * Get authenticated user's node ID
   * @returns {Promise<string>} - User's global node ID
   */
  async getAuthenticatedUserNodeID() {
    return await this.getNodeIDFromREST('/user');
  }

  /**
   * Get repository node ID
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<string>} - Repository's global node ID
   */
  async getRepositoryNodeID(owner, repo) {
    return await this.getNodeIDFromREST(`/repos/${owner}/${repo}`);
  }

  /**
   * Get issue node ID
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue number
   * @returns {Promise<string>} - Issue's global node ID
   */
  async getIssueNodeID(owner, repo, issueNumber) {
    return await this.getNodeIDFromREST(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  /**
   * Get pull request node ID
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} prNumber - Pull request number
   * @returns {Promise<string>} - PR's global node ID
   */
  async getPullRequestNodeID(owner, repo, prNumber) {
    return await this.getNodeIDFromREST(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  }

  /**
   * Complete workflow: REST → GraphQL
   * 1. Get node_id from REST
   * 2. Get type from GraphQL
   * 3. Query full object in GraphQL
   * 
   * @param {string} restEndpoint - REST API endpoint
   * @param {string} graphqlFields - Fields to query in GraphQL
   * @returns {Promise<object>} - Complete object data
   */
  async restToGraphQL(restEndpoint, graphqlFields) {
    // Step 1: Get node_id from REST
    const nodeId = await this.getNodeIDFromREST(restEndpoint);
    
    // Step 2: Get type from GraphQL
    const type = await this.getNodeType(nodeId);
    
    // Step 3: Query full object in GraphQL
    return await this.lookupNode(nodeId, type, graphqlFields);
  }
}

module.exports = { GitHubNodeIDManager };
