
import React from 'react';

export const APP_NAME = "Cricket Scorer Pro";

export const NAV_LINKS = {
  HOME: '/',
  LOGIN: '/login',
  STANDINGS: '/standings',
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_LEAGUES: '/admin/leagues',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_PLAYERS: '/admin/players',
  ADMIN_MATCHES: '/admin/matches',
  ADMIN_SETTINGS: '/admin/settings',
  // Scorer
  SCORING_HOME: '/scoring', // lists matches to score
  SCORE_MATCH_DYNAMIC: (matchId: string) => `/scoring/${matchId}`,
  // Public
  VIEW_SCORECARD_DYNAMIC: (matchId: string) => `/matches/${matchId}/scorecard`,
  VIEW_PLAYER_DYNAMIC: (playerId: string) => `/players/${playerId}`,
  // Player
  PLAYER_PROFILE: '/profile',
};

export const ICONS = {
  DASHBOARD: <i className="fas fa-tachometer-alt"></i>,
  LEAGUES: <i className="fas fa-trophy"></i>,
  TEAMS: <i className="fas fa-users"></i>,
  PLAYERS: <i className="fas fa-user-friends"></i>,
  MATCHES: <i className="fas fa-cricket-ball"></i>, // fa-cricket is from Font Awesome 5, use fa-cricket-ball for FA6
  SETTINGS: <i className="fas fa-cog"></i>,
  SCORING: <i className="fas fa-pencil-alt"></i>,
  LOGOUT: <i className="fas fa-sign-out-alt"></i>,
  LOGIN: <i className="fas fa-sign-in-alt"></i>,
  PROFILE: <i className="fas fa-user-circle"></i>,
  HOME: <i className="fas fa-home"></i>,
  STATS: <i className="fas fa-chart-bar"></i>,
  PLUS: <i className="fas fa-plus"></i>,
  EDIT: <i className="fas fa-edit"></i>,
  DELETE: <i className="fas fa-trash"></i>,
  VIEW: <i className="fas fa-eye"></i>,
  SAVE: <i className="fas fa-save"></i>,
  CANCEL: <i className="fas fa-times"></i>,
  ARROW_LEFT: <i className="fas fa-arrow-left"></i>,
  ARROW_RIGHT: <i className="fas fa-arrow-right"></i>,
  SPINNER: <i className="fas fa-spinner fa-spin"></i>,
  WARNING: <i className="fas fa-exclamation-triangle"></i>,
  INFO: <i className="fas fa-info-circle"></i>,
  SUCCESS: <i className="fas fa-check-circle"></i>,
};

export const DEFAULT_OVERS = 15;

// Centralized API URL
// For development, use: 'http://localhost:3001/api'
// For production, replace with your deployed backend URL, e.g., 'https://your-backend-url.com/api'
export const BASE_API_URL = 'https://cricket-scorer-api-65205660267.us-east1.run.app/api';
// console.log('Constants.tsx loaded, BASE_API_URL:', BASE_API_URL); // Optional: for deep debugging constants file load
