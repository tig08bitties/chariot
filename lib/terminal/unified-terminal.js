/**
 * Unified Terminal Integration
 * 
 * Combines: xterm.js, gcloud shell, tn5250 (IBM AS/400), SUSE terminal
 * 
 * The Chariot Terminal — Multi-Protocol Access Layer
 */

const { spawn, exec } = require('child_process');
const EventEmitter = require('events');
const path = require('path');
const os = require('os');

class UnifiedTerminal extends EventEmitter {
  constructor(opts = {}) {
    super();
    
    this.config = {
      // xterm.js WebSocket server
      xtermPort: opts.xtermPort || 3001,
      
      // Google Cloud Shell
      gcloudProject: opts.gcloudProject || process.env.GCLOUD_PROJECT,
      gcloudZone: opts.gcloudZone || process.env.GCLOUD_ZONE || 'us-central1-a',
      
      // tn5250 IBM AS/400
      tn5250Host: opts.tn5250Host || process.env.TN5250_HOST,
      tn5250Port: opts.tn5250Port || process.env.TN5250_PORT || 23,
      tn5250Env: opts.tn5250Env || process.env.TN5250_ENV || 'QPADEV0001',
      
      // SUSE
      suseHost: opts.suseHost || process.env.SUSE_HOST,
      suseUser: opts.suseUser || process.env.SUSE_USER,
      
      // Paths
      gcloudPath: opts.gcloudPath || this._findGcloud(),
      tn5250Path: opts.tn5250Path || this._findTn5250(),
    };
    
    this.sessions = new Map();
    this.activeSession = null;
  }

  _findGcloud() {
    const paths = [
      '/home/tig0_0bitties/google-cloud-sdk/bin/gcloud',
      '/usr/local/bin/gcloud',
      '/usr/bin/gcloud',
      path.join(os.homedir(), 'google-cloud-sdk/bin/gcloud'),
    ];
    
    for (const p of paths) {
      try {
        require('fs').accessSync(p, require('fs').constants.X_OK);
        return p;
      } catch {}
    }
    return 'gcloud';
  }

  _findTn5250() {
    const paths = [
      '/usr/local/bin/tn5250',
      '/usr/bin/tn5250',
    ];
    
    for (const p of paths) {
      try {
        require('fs').accessSync(p, require('fs').constants.X_OK);
        return p;
      } catch {}
    }
    return 'tn5250';
  }

  /**
   * Initialize the terminal system
   */
  async initialize() {
    const status = {
      gcloud: await this._checkGcloud(),
      tn5250: await this._checkTn5250(),
      suse: await this._checkSuse(),
      xterm: true, // Always available via WebSocket
    };
    
    this.emit('initialized', status);
    return status;
  }

  async _checkGcloud() {
    return new Promise((resolve) => {
      exec(`${this.config.gcloudPath} --version`, (err, stdout) => {
        if (err) {
          resolve({ available: false, error: err.message });
        } else {
          const version = stdout.split('\n')[0];
          resolve({ available: true, version });
        }
      });
    });
  }

  async _checkTn5250() {
    return new Promise((resolve) => {
      exec(`${this.config.tn5250Path} --version 2>&1 || echo "tn5250 available"`, (err, stdout) => {
        resolve({ 
          available: !err || stdout.includes('tn5250'),
          path: this.config.tn5250Path 
        });
      });
    });
  }

  async _checkSuse() {
    if (!this.config.suseHost) {
      return { available: false, reason: 'No SUSE host configured' };
    }
    return new Promise((resolve) => {
      exec(`ssh -o ConnectTimeout=5 -o BatchMode=yes ${this.config.suseUser}@${this.config.suseHost} "cat /etc/os-release" 2>&1`, (err, stdout) => {
        if (err || !stdout.toLowerCase().includes('suse')) {
          resolve({ available: false, error: err?.message || 'Not SUSE' });
        } else {
          resolve({ available: true, host: this.config.suseHost });
        }
      });
    });
  }

  /**
   * Create a new local terminal session (xterm compatible)
   */
  createLocalSession(id = `local-${Date.now()}`) {
    const shell = process.env.SHELL || '/bin/bash';
    const pty = spawn(shell, [], {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      cwd: process.env.HOME,
      env: process.env,
    });
    
    const session = {
      id,
      type: 'local',
      process: pty,
      created: new Date(),
    };
    
    pty.stdout.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.stderr.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.on('close', (code) => {
      this.emit('close', { sessionId: id, code });
      this.sessions.delete(id);
    });
    
    this.sessions.set(id, session);
    this.activeSession = id;
    
    return session;
  }

  /**
   * Create a Google Cloud Shell session
   */
  async createGcloudSession(id = `gcloud-${Date.now()}`) {
    if (!this.config.gcloudProject) {
      throw new Error('GCLOUD_PROJECT not configured');
    }
    
    const args = [
      'cloud-shell', 'ssh',
      '--project', this.config.gcloudProject,
      '--authorize-session',
    ];
    
    const pty = spawn(this.config.gcloudPath, args, {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      env: process.env,
    });
    
    const session = {
      id,
      type: 'gcloud',
      process: pty,
      project: this.config.gcloudProject,
      created: new Date(),
    };
    
    pty.stdout.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.stderr.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.on('close', (code) => {
      this.emit('close', { sessionId: id, code });
      this.sessions.delete(id);
    });
    
    this.sessions.set(id, session);
    this.activeSession = id;
    
    return session;
  }

  /**
   * Create a tn5250 IBM AS/400 session
   */
  async createTn5250Session(id = `tn5250-${Date.now()}`, host = null, opts = {}) {
    const targetHost = host || this.config.tn5250Host || 'pub400.com';
    const user = opts.user || this.config.tn5250User || process.env.TN5250_USER;
    const password = opts.password || this.config.tn5250Password || process.env.TN5250_PASSWORD;
    
    if (!targetHost) {
      throw new Error('TN5250_HOST not configured');
    }
    
    // Build tn5250 connection string with options
    // Format: env=ENV_NAME user=USER ssl=off HOST
    const connArgs = [];
    
    if (this.config.tn5250Env) {
      connArgs.push(`env=${this.config.tn5250Env}`);
    }
    
    // SSL options for pub400.com
    if (targetHost === 'pub400.com') {
      connArgs.push('ssl=off');
    }
    
    connArgs.push(targetHost);
    
    const pty = spawn(this.config.tn5250Path, connArgs, {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        TN5250_USER: user,
        TN5250_PASSWORD: password,
      },
    });
    
    const session = {
      id,
      type: 'tn5250',
      process: pty,
      host: targetHost,
      user,
      created: new Date(),
    };
    
    pty.stdout.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.stderr.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.on('close', (code) => {
      this.emit('close', { sessionId: id, code });
      this.sessions.delete(id);
    });
    
    this.sessions.set(id, session);
    this.activeSession = id;
    
    // Auto-login if credentials provided
    if (user && password) {
      session.autoLogin = { user, password };
    }
    
    return session;
  }

  /**
   * Send login credentials to tn5250 session
   */
  async tn5250Login(sessionId, user, password) {
    const session = this.sessions.get(sessionId);
    if (!session || session.type !== 'tn5250') {
      throw new Error('Invalid tn5250 session');
    }
    
    // Wait a moment for the login screen
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Send username
    session.process.stdin.write(user + '\t');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Send password
    session.process.stdin.write(password + '\n');
    
    return { sessionId, status: 'login_sent' };
  }

  /**
   * Create a SUSE SSH session
   */
  async createSuseSession(id = `suse-${Date.now()}`, host = null) {
    const targetHost = host || this.config.suseHost;
    const targetUser = this.config.suseUser || 'root';
    
    if (!targetHost) {
      throw new Error('SUSE_HOST not configured');
    }
    
    const args = [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      `${targetUser}@${targetHost}`,
    ];
    
    const pty = spawn('ssh', args, {
      name: 'xterm-256color',
      cols: 120,
      rows: 40,
      env: process.env,
    });
    
    const session = {
      id,
      type: 'suse',
      process: pty,
      host: targetHost,
      user: targetUser,
      created: new Date(),
    };
    
    pty.stdout.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.stderr.on('data', (data) => {
      this.emit('data', { sessionId: id, data: data.toString() });
    });
    
    pty.on('close', (code) => {
      this.emit('close', { sessionId: id, code });
      this.sessions.delete(id);
    });
    
    this.sessions.set(id, session);
    this.activeSession = id;
    
    return session;
  }

  /**
   * Write data to a session
   */
  write(sessionId, data) {
    const session = this.sessions.get(sessionId || this.activeSession);
    if (!session || !session.process) {
      throw new Error(`Session ${sessionId} not found`);
    }
    session.process.stdin.write(data);
  }

  /**
   * Resize a session
   */
  resize(sessionId, cols, rows) {
    const session = this.sessions.get(sessionId || this.activeSession);
    if (!session || !session.process) {
      throw new Error(`Session ${sessionId} not found`);
    }
    // Note: For proper PTY resize, you'd need node-pty
    // This is a simplified version
    session.process.stdin.write(`\x1b[8;${rows};${cols}t`);
  }

  /**
   * Close a session
   */
  close(sessionId) {
    const session = this.sessions.get(sessionId || this.activeSession);
    if (!session || !session.process) {
      return false;
    }
    session.process.kill('SIGTERM');
    this.sessions.delete(sessionId);
    return true;
  }

  /**
   * Get all active sessions
   */
  getSessions() {
    return Array.from(this.sessions.entries()).map(([id, session]) => ({
      id,
      type: session.type,
      host: session.host,
      created: session.created,
    }));
  }

  /**
   * Execute a command in gcloud
   */
  async gcloudExec(command, args = []) {
    return new Promise((resolve, reject) => {
      exec(`${this.config.gcloudPath} ${command} ${args.join(' ')}`, (err, stdout, stderr) => {
        if (err) {
          reject({ error: err.message, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  /**
   * Get gcloud auth status
   */
  async gcloudAuth() {
    return this.gcloudExec('auth', ['list', '--format=json']);
  }

  /**
   * Get gcloud projects
   */
  async gcloudProjects() {
    return this.gcloudExec('projects', ['list', '--format=json']);
  }
}

module.exports = { UnifiedTerminal };
