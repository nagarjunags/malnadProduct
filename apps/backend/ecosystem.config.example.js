// PM2 Ecosystem Configuration for Medusa Backend
// Copy this to ecosystem.config.js and update the paths

module.exports = {
  apps: [
    {
      // Application name
      name: 'medusa-backend',
      
      // Start command
      script: 'npx',
      args: 'medusa start',
      
      // Working directory - UPDATE THIS to your actual path
      cwd: '/home/your-username/medusa-backend',
      
      // Number of instances
      // Set to 1 for single instance
      // Set to 'max' to use all CPU cores (use with cluster mode)
      instances: 1,
      
      // Execution mode: 'fork' or 'cluster'
      // Use 'fork' for single instance
      exec_mode: 'fork',
      
      // Auto-restart on crash
      autorestart: true,
      
      // Don't watch files for changes in production
      watch: false,
      
      // Restart if memory usage exceeds this limit
      max_memory_restart: '1G',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 9000
      },
      
      // Development environment (use with: pm2 start ecosystem.config.js --env development)
      env_development: {
        NODE_ENV: 'development',
        PORT: 9000
      },
      
      // Production environment (default)
      env_production: {
        NODE_ENV: 'production',
        PORT: 9000
      },
      
      // Logging configuration
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      
      // Log rotation (requires pm2-logrotate module)
      // Install with: pm2 install pm2-logrotate
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart delay (in milliseconds)
      restart_delay: 4000,
      
      // Max restarts within min_uptime before app is considered unstable
      max_restarts: 10,
      min_uptime: '10s',
      
      // Listen for SIGINT (useful for graceful shutdown)
      listen_timeout: 3000,
      kill_timeout: 5000,
      
      // Increase if you have slow startup
      wait_ready: false,
      
      // Advanced features (optional)
      instance_var: 'INSTANCE_ID',
      
      // Merge logs from all instances (useful with cluster mode)
      merge_logs: true,
      
      // Disable automatic restart in unstable situations
      autorestart: true,
      
      // Source maps support (if you have them)
      source_map_support: false,
      
      // Force process to be in a specific state
      force: true,
      
      // Node.js interpreter arguments (optional)
      // node_args: '--max-old-space-size=2048',
      
      // Increase if you need more CPU time for startup tasks
      // interpreter_args: '--max-old-space-size=2048',
    }
  ],
  
  // Deployment configuration (optional - for PM2 deploy feature)
  deploy: {
    production: {
      // SSH user
      user: 'your-username',
      
      // SSH host
      host: 'your-vm-ip',
      
      // SSH port
      port: '22',
      
      // Git repository
      repo: 'git@github.com:yourusername/your-repo.git',
      
      // Branch to deploy
      ref: 'origin/main',
      
      // Path on remote server
      path: '/home/your-username/medusa-backend',
      
      // Pre-deployment commands (on remote server)
      'pre-deploy-local': '',
      
      // Post-deployment commands (on remote server)
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      
      // Pre-setup commands
      'pre-setup': '',
      
      // Environment variables for SSH
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};

// Usage:
// 
// Start application:
//   pm2 start ecosystem.config.js
//
// Start in development:
//   pm2 start ecosystem.config.js --env development
//
// Start in production:
//   pm2 start ecosystem.config.js --env production
//
// Restart:
//   pm2 restart medusa-backend
//
// Stop:
//   pm2 stop medusa-backend
//
// Delete:
//   pm2 delete medusa-backend
//
// View logs:
//   pm2 logs medusa-backend
//
// Monitor:
//   pm2 monit
//
// Save configuration:
//   pm2 save
//
// Deploy (if using deploy config):
//   pm2 deploy production setup    # First time only
//   pm2 deploy production           # Subsequent deploys
//
// More info: https://pm2.keymetrics.io/docs/usage/application-declaration/
