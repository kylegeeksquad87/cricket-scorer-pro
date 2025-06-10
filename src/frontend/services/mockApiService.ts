
import { User, UserRole, League, Team, Player, Match, Scorecard, MatchStatus, LeagueFormData, TeamFormData, PlayerFormData, MatchFormData, Innings, Ball } from '../types';

// Mock Database
let usersDB: User[] = [
  { id: 'admin1', username: 'admin', role: UserRole.ADMIN, email: 'admin@example.com' },
  { id: 'scorer1', username: 'scorer', role: UserRole.SCORER, email: 'scorer@example.com' },
  { id: 'player_user1', username: 'Rohit Sharma', role: UserRole.PLAYER, email: 'rohit.s@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=player_user1' },
];

let playersDB: Player[] = [
  { id: 'p1', firstName: 'Rohit', lastName: 'Sharma', email: 'rohit.s@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p1', teamIds: ['t1'] }, // MI
  { id: 'p2', firstName: 'Virat', lastName: 'Kohli', email: 'virat.k@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p2', teamIds: ['t_rcb'] }, // RCB
  { id: 'p3', firstName: 'Jasprit', lastName: 'Bumrah', email: 'jasprit.b@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p3', teamIds: ['t1'] }, // MI
  { id: 'p4', firstName: 'Smriti', lastName: 'Mandhana', email: 'smriti.m@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p4', teamIds: ['t2', 't5'] },
  { id: 'p5', firstName: 'Harmanpreet', lastName: 'Kaur', email: 'harman.k@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p5', teamIds: ['t2'] },
  { id: 'p6', firstName: 'Shafali', lastName: 'Verma', email: 'shafali.v@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p6', teamIds: ['t2'] },
  { id: 'p7', firstName: 'Kane', lastName: 'Williamson', email: 'kane.w@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p7', teamIds: ['t3'] },
  { id: 'p8', firstName: 'Sophie', lastName: 'Devine', email: 'sophie.d@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p8', teamIds: ['t6'] },
  { id: 'p9', firstName: 'Babar', lastName: 'Azam', email: 'babar.a@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p9', teamIds: ['t4'] }, // No longer PBKS captain
  { id: 'p10', firstName: 'Meg', lastName: 'Lanning', email: 'meg.l@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p10', teamIds: ['t5'] },
  { id: 'p11', firstName: 'Rashid', lastName: 'Khan', email: 'rashid.k@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p11', teamIds: ['t3', 't_gt'] }, // GT
  { id: 'p12', firstName: 'Ellyse', lastName: 'Perry', email: 'ellyse.p@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p12', teamIds: ['t6', 't8'] },
  { id: 'p13', firstName: 'Ben', lastName: 'Stokes', email: 'ben.s@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p13', teamIds: ['t7'] },
  { id: 'p14', firstName: 'Alyssa', lastName: 'Healy', email: 'alyssa.h@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p14', teamIds: ['t8'] },
  { id: 'p15', firstName: 'Joe', lastName: 'Root', email: 'joe.r@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p15', teamIds: ['t7'] },
  { id: 'p16', firstName: 'Suresh', lastName: 'Raina', email: 'suresh.raina@example.com', teamIds: ['t_csk'], profilePictureUrl: 'https://i.pravatar.cc/150?u=p16' }, // CSK
  { id: 'p17', firstName: 'Mithali', lastName: 'Raj', email: 'mithali.raj@example.com', teamIds: ['t2'], profilePictureUrl: 'https://i.pravatar.cc/150?u=p17' },
  { id: 'p18', firstName: 'David', lastName: 'Warner', email: 'david.warner@example.com', teamIds: ['t9'], profilePictureUrl: 'https://i.pravatar.cc/150?u=p18' }, // DC
  { id: 'p19', firstName: 'Ashleigh', lastName: 'Gardner', email: 'ash.gardner@example.com', teamIds: ['t5'], profilePictureUrl: 'https://i.pravatar.cc/150?u=p19' },
  { id: 'p20', firstName: 'Trent', lastName: 'Boult', email: 'trent.boult@example.com', teamIds: ['t3', 't_rr'], profilePictureUrl: 'https://i.pravatar.cc/150?u=p20' }, // RR
  // New IPL Players
  { id: 'p_msd', firstName: 'MS', lastName: 'Dhoni', email: 'ms.dhoni@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_msd', teamIds: ['t_csk'] },
  { id: 'p_faf', firstName: 'Faf', lastName: 'du Plessis', email: 'faf.dp@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_faf', teamIds: ['t_rcb'] },
  { id: 'p_shreyas', firstName: 'Shreyas', lastName: 'Iyer', email: 'shreyas.i@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_shreyas', teamIds: ['t_kkr'] },
  { id: 'p_cummins', firstName: 'Pat', lastName: 'Cummins', email: 'pat.c@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_cummins', teamIds: ['t_srh'] },
  { id: 'p_sanju', firstName: 'Sanju', lastName: 'Samson', email: 'sanju.s@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_sanju', teamIds: ['t_rr'] },
  { id: 'p_gill', firstName: 'Shubman', lastName: 'Gill', email: 'shubman.g@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_gill', teamIds: ['t_gt'] },
  { id: 'p_klr', firstName: 'KL', lastName: 'Rahul', email: 'kl.rahul@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_klr', teamIds: ['t_lsg'] },
  { id: 'p_pant', firstName: 'Rishabh', lastName: 'Pant', email: 'rishabh.p@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_pant', teamIds: ['t9'] }, // DC
  { id: 'p_dhawan', firstName: 'Shikhar', lastName: 'Dhawan', email: 'shikhar.d@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_dhawan', teamIds: ['t10'] }, // PBKS
  { id: 'p_ruturaj', firstName: 'Ruturaj', lastName: 'Gaikwad', email: 'rutu.g@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_ruturaj', teamIds: ['t_csk'] },
  { id: 'p_hardik', firstName: 'Hardik', lastName: 'Pandya', email: 'hardik.p@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p_hardik', teamIds: ['t1'] }, // MI
];

usersDB.push({ id: 'p1', username: 'Rohit Sharma User', role: UserRole.PLAYER, email: 'rohit.s.user@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p1_user' });
usersDB.push({ id: 'p2', username: 'Virat Kohli User', role: UserRole.PLAYER, email: 'virat.k.user@example.com', profilePictureUrl: 'https://i.pravatar.cc/150?u=p2_user' });


let leaguesDB: League[] = [
  { id: 'l1', name: 'TATA IPL 2024', location: 'India', startDate: '2024-03-22', endDate: '2024-05-26', teams: [] },
  { id: 'l2', name: 'Women\'s Super League 2024', location: 'Various National Grounds', startDate: '2024-06-15', endDate: '2024-07-30', teams: [] },
  { id: 'l3', name: 'Global Championship Series', location: 'International Venues', startDate: '2024-09-01', endDate: '2024-10-15', teams: [] },
  { id: 'l4', name: 'Community Cup', location: 'Local Parks', startDate: '2024-07-01', endDate: '2024-08-01', teams: [] },
];

let teamsDB: Team[] = [
  // League l1 Teams (TATA IPL 2024)
  { id: 't1', name: 'Mumbai Indians', leagueId: 'l1', captainId: 'p_hardik', logoUrl: 'https://picsum.photos/seed/t1_mi/200/150', players: [] }, // Rohit Sharma p1, Bumrah p3 also in this team via player.teamIds
  { id: 't9', name: 'Delhi Capitals', leagueId: 'l1', captainId: 'p_pant', logoUrl: 'https://picsum.photos/seed/t9_dc/200/150', players: [] }, // David Warner p18 also in this team
  { id: 't10', name: 'Punjab Kings', leagueId: 'l1', captainId: 'p_dhawan', logoUrl: 'https://picsum.photos/seed/t10_pbks/200/150', players: [] },
  { id: 't_csk', name: 'Chennai Super Kings', leagueId: 'l1', captainId: 'p_ruturaj', logoUrl: 'https://picsum.photos/seed/t_csk/200/150', players: [] }, // MS Dhoni p_msd, Suresh Raina p16
  { id: 't_rcb', name: 'Royal Challengers Bengaluru', leagueId: 'l1', captainId: 'p_faf', logoUrl: 'https://picsum.photos/seed/t_rcb/200/150', players: [] }, // Virat Kohli p2
  { id: 't_kkr', name: 'Kolkata Knight Riders', leagueId: 'l1', captainId: 'p_shreyas', logoUrl: 'https://picsum.photos/seed/t_kkr/200/150', players: [] },
  { id: 't_srh', name: 'Sunrisers Hyderabad', leagueId: 'l1', captainId: 'p_cummins', logoUrl: 'https://picsum.photos/seed/t_srh/200/150', players: [] },
  { id: 't_rr', name: 'Rajasthan Royals', leagueId: 'l1', captainId: 'p_sanju', logoUrl: 'https://picsum.photos/seed/t_rr/200/150', players: [] }, // Trent Boult p20
  { id: 't_gt', name: 'Gujarat Titans', leagueId: 'l1', captainId: 'p_gill', logoUrl: 'https://picsum.photos/seed/t_gt/200/150', players: [] }, // Rashid Khan p11
  { id: 't_lsg', name: 'Lucknow Super Giants', leagueId: 'l1', captainId: 'p_klr', logoUrl: 'https://picsum.photos/seed/t_lsg/200/150', players: [] },

  // League l2 Teams
  { id: 't2', name: 'Sydney Sixers Women', leagueId: 'l2', captainId: 'p4', logoUrl: 'https://picsum.photos/seed/t2/200/150', players: [] },
  { id: 't11', name: 'Melbourne Stars Women', leagueId: 'l2', captainId: 'p10', logoUrl: 'https://picsum.photos/seed/t11/200/150', players: [] },
  { id: 't12', name: 'Brisbane Heat Women', leagueId: 'l2', captainId: 'p12', logoUrl: 'https://picsum.photos/seed/t12/200/150', players: [] },
  
  // League l3 Teams
  { id: 't3', name: 'New Zealand National', leagueId: 'l3', captainId: 'p7', logoUrl: 'https://picsum.photos/seed/t3/200/150', players: [] },
  { id: 't4', name: 'Pakistan National', leagueId: 'l3', captainId: 'p9', logoUrl: 'https://picsum.photos/seed/t4/200/150', players: [] }, 
  { id: 't5', name: 'Australia Women National', leagueId: 'l3', captainId: 'p10', logoUrl: 'https://picsum.photos/seed/t5/200/150', players: [] },
  { id: 't6', name: 'New Zealand Women National', leagueId: 'l3', captainId: 'p8', logoUrl: 'https://picsum.photos/seed/t6/200/150', players: [] },
  { id: 't7', name: 'England National', leagueId: 'l3', captainId: 'p13', logoUrl: 'https://picsum.photos/seed/t7/200/150', players: [] },
  { id: 't8', name: 'Australia National', leagueId: 'l3', captainId: 'p18', logoUrl: 'https://picsum.photos/seed/t8/200/150', players: [] },

  // League l4 Teams
  { id: 't13', name: 'Parkside Dynamos', leagueId: 'l4', logoUrl: 'https://picsum.photos/seed/t13/200/150', players: [] },
  { id: 't14', name: 'Riverbank Royals', leagueId: 'l4', logoUrl: 'https://picsum.photos/seed/t14/200/150', players: [] },
];


let matchesDB: Match[] = [
  // TATA IPL 2024 Matches ('l1')
  { id: 'm_ipl_csk_rcb', leagueId: 'l1', teamAId: 't_csk', teamBId: 't_rcb', dateTime: new Date('2024-03-22T19:30:00Z').toISOString(), venue: 'MA Chidambaram Stadium, Chennai', overs: 20, status: MatchStatus.COMPLETED, result: 'CSK won by 6 wickets', tossWonByTeamId: 't_rcb', choseTo: 'Bat', scorecardId: 'sc_ipl_csk_rcb'},
  { id: 'm_ipl_mi_kkr', leagueId: 'l1', teamAId: 't1', teamBId: 't_kkr', dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Wankhede Stadium, Mumbai', overs: 20, status: MatchStatus.SCHEDULED },
  { id: 'm_ipl_srh_rr', leagueId: 'l1', teamAId: 't_srh', teamBId: 't_rr', dateTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), venue: 'Rajiv Gandhi Intl. Stadium, Hyderabad', overs: 20, status: MatchStatus.LIVE, tossWonByTeamId: 't_srh', choseTo: 'Bat', scorecardId: 'sc_ipl_srh_rr'},
  { id: 'm_ipl_gt_lsg', leagueId: 'l1', teamAId: 't_gt', teamBId: 't_lsg', dateTime: new Date('2024-04-07T19:30:00Z').toISOString(), venue: 'Narendra Modi Stadium, Ahmedabad', overs: 20, status: MatchStatus.COMPLETED, result: 'LSG won by 33 runs', tossWonByTeamId: 't_lsg', choseTo: 'Bat', scorecardId: 'sc_ipl_gt_lsg'},
  { id: 'm_ipl_dc_pbks', leagueId: 'l1', teamAId: 't9', teamBId: 't10', dateTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Arun Jaitley Stadium, Delhi', overs: 20, status: MatchStatus.SCHEDULED },

  // Existing Matches from other leagues
  { id: 'm1', leagueId: 'l1', teamAId: 't1', teamBId: 't9', dateTime: new Date('2024-04-03T19:30:00Z').toISOString(), venue: 'Wankhede Stadium', overs: 20, status: MatchStatus.COMPLETED, result: 'Mumbai Indians won by 15 runs', tossWonByTeamId: 't1', choseTo: 'Bat', scorecardId: 'sc_m1'}, // This can be an older MI vs DC from same league or moved
  { id: 'm2', leagueId: 'l1', teamAId: 't9', teamBId: 't10', dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), venue: 'Arun Jaitley Stadium', overs: 20, status: MatchStatus.SCHEDULED, tossWonByTeamId: 't10', choseTo: 'Bowl' },
  { id: 'm3', leagueId: 'l1', teamAId: 't1', teamBId: 't10', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Wankhede Stadium', overs: 20, status: MatchStatus.SCHEDULED },
  
  { id: 'm4', leagueId: 'l2', teamAId: 't2', teamBId: 't11', dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), venue: 'North Sydney Oval', overs: 20, status: MatchStatus.COMPLETED, result: 'Sydney Sixers Women won by 7 wickets', tossWonByTeamId: 't11', choseTo: 'Bat', scorecardId: 'sc_m4'},
  { id: 'm5', leagueId: 'l2', teamAId: 't11', teamBId: 't12', dateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Junction Oval', overs: 20, status: MatchStatus.SCHEDULED },
  { id: 'm10', leagueId: 'l2', teamAId: 't2', teamBId: 't12', dateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), venue: 'North Sydney Oval', overs: 20, status: MatchStatus.LIVE, tossWonByTeamId: 't2', choseTo: 'Bat', scorecardId: 'sc_m10'},

  { id: 'm6', leagueId: 'l3', teamAId: 't3', teamBId: 't7', dateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Lord\'s Cricket Ground', overs: 50, status: MatchStatus.SCHEDULED },
  { id: 'm7', leagueId: 'l3', teamAId: 't5', teamBId: 't6', dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), venue: 'MCG, Melbourne', overs: 50, status: MatchStatus.COMPLETED, result: 'Australia Women National won by 50 runs', tossWonByTeamId: 't5', choseTo: 'Bat' },
  { id: 'm8', leagueId: 'l3', teamAId: 't4', teamBId: 't8', dateTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Gaddafi Stadium', overs: 50, status: MatchStatus.SCHEDULED },
  { id: 'm9', leagueId: 'l3', teamAId: 't3', teamBId: 't8', dateTime: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), venue: 'Eden Park', overs: 20, status: MatchStatus.ABANDONED, result: 'Match Abandoned due to rain' },
];

let scorecardsDB: Scorecard[] = [
  { // Scorecard for IPL CSK vs RCB
    id: 'sc_ipl_csk_rcb', matchId: 'm_ipl_csk_rcb',
    innings1: { // RCB Batting
      battingTeamId: 't_rcb', bowlingTeamId: 't_csk', score: 173, wickets: 6, oversPlayed: 20.0, balls: [
        { over: 0, ballInOver: 1, bowlerId: 'p_deepak_chahar_csk', batsmanId: 'p_faf', nonStrikerId: 'p2', runsScored: 1, extras: {} },
        { over: 4, ballInOver: 3, bowlerId: 'p_mustafizur_csk', batsmanId: 'p_faf', nonStrikerId: 'p2', runsScored: 0, extras: {}, wicket: {type: "Caught", playerId: "p_faf", fielderId:"p_ravindra_jadeja_csk"} },
        { over: 19, ballInOver: 6, bowlerId: 'p_tushar_deshpande_csk', batsmanId: 'p_dk_rcb', nonStrikerId: 'p_anuj_rawat_rcb', runsScored: 6, extras: {} },
      ]
    },
    innings2: { // CSK Batting
      battingTeamId: 't_csk', bowlingTeamId: 't_rcb', score: 176, wickets: 4, oversPlayed: 18.4, balls: [
        { over: 0, ballInOver: 1, bowlerId: 'p_siraj_rcb', batsmanId: 'p_ruturaj', nonStrikerId: 'p_rachin_ravindra_csk', runsScored: 0, extras: {} },
        { over: 18, ballInOver: 4, bowlerId: 'p_yash_dayal_rcb', batsmanId: 'p_shivam_dube_csk', nonStrikerId: 'p_ravindra_jadeja_csk', runsScored: 4, extras: {} },
      ]
    }
  },
  { // Scorecard for Live IPL SRH vs RR
    id: 'sc_ipl_srh_rr', matchId: 'm_ipl_srh_rr',
    innings1: { // SRH Batting
      battingTeamId: 't_srh', bowlingTeamId: 't_rr', score: 90, wickets: 3, oversPlayed: 10.0, balls: [
        { over: 9, ballInOver: 1, bowlerId: 'p20', batsmanId: 'p_abhishek_sharma_srh', nonStrikerId: 'p_head_srh', runsScored: 1, extras: {} },
        { over: 9, ballInOver: 2, bowlerId: 'p20', batsmanId: 'p_head_srh', nonStrikerId: 'p_abhishek_sharma_srh', runsScored: 4, extras: {} },
        { over: 9, ballInOver: 3, bowlerId: 'p20', batsmanId: 'p_head_srh', nonStrikerId: 'p_abhishek_sharma_srh', runsScored: 0, extras: {}, wicket: { type: "Bowled", playerId: "p_head_srh" } },
        { over: 9, ballInOver: 4, bowlerId: 'p20', batsmanId: 'p_cummins', nonStrikerId: 'p_abhishek_sharma_srh', runsScored: 1, extras: {} },
        { over: 9, ballInOver: 5, bowlerId: 'p20', batsmanId: 'p_abhishek_sharma_srh', nonStrikerId: 'p_cummins', runsScored: 6, extras: {} },
        { over: 9, ballInOver: 6, bowlerId: 'p20', batsmanId: 'p_abhishek_sharma_srh', nonStrikerId: 'p_cummins', runsScored: 0, extras: {} },
      ]
    },
    // innings2 not started for live match
  },
  { // Scorecard for IPL GT vs LSG
    id: 'sc_ipl_gt_lsg', matchId: 'm_ipl_gt_lsg',
    innings1: { // LSG Batting
      battingTeamId: 't_lsg', bowlingTeamId: 't_gt', score: 163, wickets: 5, oversPlayed: 20.0, balls: [
        { over: 19, ballInOver: 6, bowlerId: 'p_rashid_gt', batsmanId: 'p_stoinis_lsg', nonStrikerId: 'p_krunal_lsg', runsScored: 2, extras: {} },
      ]
    },
    innings2: { // GT Batting
      battingTeamId: 't_gt', bowlingTeamId: 't_lsg', score: 130, wickets: 10, oversPlayed: 18.5, balls: [
        { over: 18, ballInOver: 5, bowlerId: 'p_yash_thakur_lsg', batsmanId: 'p_gill', nonStrikerId: 'p_rashid_gt', runsScored: 0, extras: {}, wicket: {type: "Caught", playerId: "p_gill", fielderId:"p_klr"} },
      ]
    }
  },
  {
    id: 'sc_m1', matchId: 'm1', // Older MI vs DC match
    innings1: { battingTeamId: 't1', bowlingTeamId: 't9', score: 180, wickets: 5, oversPlayed: 20.0, balls: [
      { over: 0, ballInOver: 1, bowlerId: 'p_dc_bowler1', batsmanId: 'p1', nonStrikerId: 'p_ishan_kishan_mi', runsScored: 1, extras: {} },
      { over: 19, ballInOver: 6, bowlerId: 'p_dc_bowler2', batsmanId: 'p_hardik', nonStrikerId: 'p3', runsScored: 6, extras: {} },
    ]},
    innings2: { battingTeamId: 't9', bowlingTeamId: 't1', score: 165, wickets: 7, oversPlayed: 20.0, balls: [
      { over: 0, ballInOver: 1, bowlerId: 'p3', batsmanId: 'p18', nonStrikerId: 'p_prithvi_shaw_dc', runsScored: 0, extras: {} },
      { over: 19, ballInOver: 6, bowlerId: 'p_mi_bowler_other', batsmanId: 'p_pant', nonStrikerId: 'p_axar_patel_dc', runsScored: 4, extras: {} },
    ]}
  },
  {
    id: 'sc_m4', matchId: 'm4',
    innings1: { battingTeamId: 't11', bowlingTeamId: 't2', score: 140, wickets: 8, oversPlayed: 20.0, balls: [
      { over: 0, ballInOver: 1, bowlerId: 'p_s6_bowler1', batsmanId: 'p10', nonStrikerId: 'p_ms_other', runsScored: 4, extras: {} },
    ]},
    innings2: { battingTeamId: 't2', bowlingTeamId: 't11', score: 141, wickets: 3, oversPlayed: 18.5, balls: [
      { over: 0, ballInOver: 1, bowlerId: 'p_ms_bowler1', batsmanId: 'p4', nonStrikerId: 'p5', runsScored: 1, extras: {} },
      { over: 18, ballInOver: 5, bowlerId: 'p_ms_bowler2', batsmanId: 'p6', nonStrikerId: 'p4', runsScored: 4, extras: {}, wicket: {type: "Caught", playerId: "p_ms_other_fielder", fielderId: "p_ms_other_fielder"} },
    ]}
  },
  { 
    id: 'sc_m10', matchId: 'm10', // Live Women's Super League
    innings1: { battingTeamId: 't2', bowlingTeamId: 't12', score: 85, wickets: 2, oversPlayed: 10.2, balls: [
        { over: 9, ballInOver: 1, bowlerId: 'p_bh_bowler1', batsmanId: 'p4', nonStrikerId: 'p5', runsScored: 1, extras: {} },
        { over: 9, ballInOver: 2, bowlerId: 'p_bh_bowler1', batsmanId: 'p5', nonStrikerId: 'p4', runsScored: 0, extras: {} },
        { over: 9, ballInOver: 3, bowlerId: 'p_bh_bowler1', batsmanId: 'p5', nonStrikerId: 'p4', runsScored: 4, extras: {} },
        { over: 9, ballInOver: 4, bowlerId: 'p_bh_bowler1', batsmanId: 'p5', nonStrikerId: 'p4', runsScored: 1, extras: {}, wicket: {type: "Run Out", playerId: "p5", fielderId:"p_bh_fielder"} },
        { over: 9, ballInOver: 5, bowlerId: 'p_bh_bowler1', batsmanId: 'p6', nonStrikerId: 'p4', runsScored: 2, extras: {} }, 
        { over: 9, ballInOver: 6, bowlerId: 'p_bh_bowler1', batsmanId: 'p6', nonStrikerId: 'p4', runsScored: 0, extras: {} },
        { over: 10, ballInOver: 1, bowlerId: 'p_bh_bowler2', batsmanId: 'p4', nonStrikerId: 'p6', runsScored: 1, extras: {} },
        { over: 10, ballInOver: 2, bowlerId: 'p_bh_bowler2', batsmanId: 'p6', nonStrikerId: 'p4', runsScored: 6, extras: {} },
    ]},
  }
];


const simulateDelay = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500)); 

const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Auth
export const mockLogin = (username: string, _password: string): Promise<User> => {
  return simulateDelay(null).then(() => {
    const user = usersDB.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) return user;
    const playerAsUser = playersDB.find(p => \`\${p.firstName} \${p.lastName}\`.toLowerCase() === username.toLowerCase() || p.email?.toLowerCase() === username.toLowerCase());
    if(playerAsUser) {
        const existingUserMapping = usersDB.find(u => u.id === playerAsUser.id);
        if(existingUserMapping) return existingUserMapping; 
        return {
            id: playerAsUser.id,
            username: \`\${playerAsUser.firstName} \${playerAsUser.lastName}\`,
            role: UserRole.PLAYER, 
            email: playerAsUser.email,
            profilePictureUrl: playerAsUser.profilePictureUrl
        };
    }
    throw new Error('Invalid credentials');
  });
};

export const mockFetchUserProfile = (userId: string): Promise<User> => {
   return simulateDelay(null).then(() => {
    const user = usersDB.find(u => u.id === userId);
    if (user) return user;
    const player = playersDB.find(p => p.id === userId);
    if (player) {
        return {
            id: player.id,
            username: \`\${player.firstName} \${player.lastName}\`,
            role: UserRole.PLAYER,
            email: player.email,
            profilePictureUrl: player.profilePictureUrl
        };
    }
    throw new Error('User not found');
  });
};

// Leagues
export const fetchLeagues = (): Promise<League[]> => simulateDelay([...leaguesDB].map(l => ({...l, teams: teamsDB.filter(t => t.leagueId === l.id) })));
export const fetchLeagueById = (id: string): Promise<League | undefined> => {
    const league = leaguesDB.find(l => l.id === id);
    if (!league) return simulateDelay(undefined);
    return simulateDelay({...league, teams: teamsDB.filter(t => t.leagueId === league.id)});
};
export const createLeague = (data: LeagueFormData): Promise<League> => {
  const newLeague: League = { ...data, id: generateId(), teams: [] };
  leaguesDB.push(newLeague);
  return simulateDelay(newLeague);
};
export const updateLeague = (id: string, data: Partial<LeagueFormData>): Promise<League | undefined> => {
  const index = leaguesDB.findIndex(l => l.id === id);
  if (index === -1) return simulateDelay(undefined);
  leaguesDB[index] = { ...leaguesDB[index], ...data };
  return simulateDelay(leaguesDB[index]);
};
export const deleteLeague = (id: string): Promise<boolean> => {
  const initialLength = leaguesDB.length;
  leaguesDB = leaguesDB.filter(l => l.id !== id);
  teamsDB = teamsDB.filter(t => t.leagueId !== id);
  matchesDB = matchesDB.filter(m => m.leagueId !== id);
  return simulateDelay(leaguesDB.length < initialLength);
};


// Teams
export const fetchTeams = (leagueId?: string): Promise<Team[]> => {
  const teams = leagueId ? teamsDB.filter(t => t.leagueId === leagueId) : [...teamsDB];
  return simulateDelay(teams.map(team => ({
    ...team,
    players: playersDB.filter(p => p.teamIds.includes(team.id))
  })));
};
export const fetchTeamById = (id: string): Promise<Team | undefined> => {
  const team = teamsDB.find(t => t.id === id);
  if (!team) return simulateDelay(undefined);
  return simulateDelay({ ...team, players: playersDB.filter(p => p.teamIds.includes(team.id)) });
};
export const createTeam = (data: TeamFormData & { leagueId: string }): Promise<Team> => {
  const newTeam: Team = { ...data, id: generateId(), players: [] };
  teamsDB.push(newTeam);
  return simulateDelay(newTeam);
};

// Players
export const fetchPlayers = (teamId?: string): Promise<Player[]> => {
  const players = teamId ? playersDB.filter(p => p.teamIds.includes(teamId)) : [...playersDB];
  return simulateDelay(players);
};
export const fetchPlayerById = (id: string): Promise<Player | undefined> => simulateDelay(playersDB.find(p => p.id === id));

export const createPlayer = (data: PlayerFormData & {teamId?: string}): Promise<Player> => {
  const newPlayer: Player = { 
      ...data, 
      id: generateId(), 
      teamIds: data.teamId ? [data.teamId] : [],
      firstName: data.firstName || '',
      lastName: data.lastName || '',
    };
  playersDB.push(newPlayer);
  return simulateDelay(newPlayer);
};

// Matches
export const fetchMatches = (leagueId?: string): Promise<Match[]> => {
  const matches = leagueId ? matchesDB.filter(m => m.leagueId === leagueId) : [...matchesDB];
  return simulateDelay(matches);
};
export const fetchMatchById = (id: string): Promise<Match | undefined> => simulateDelay(matchesDB.find(m => m.id === id));
export const createMatch = (data: MatchFormData): Promise<Match> => {
  const newMatch: Match = { ...data, id: generateId(), status: MatchStatus.SCHEDULED };
  matchesDB.push(newMatch);
  return simulateDelay(newMatch);
};

// Scorecard
export const fetchScorecard = (matchId: string): Promise<Scorecard | undefined> => {
  const scorecard = scorecardsDB.find(sc => sc.matchId === matchId);
  if(!scorecard && matchId){
      const match = matchesDB.find(m => m.id === matchId);
      if(match && match.status === MatchStatus.LIVE && match.scorecardId){
          const battingTeam = match.tossWonByTeamId === match.teamAId ? 
                                (match.choseTo === 'Bat' ? match.teamAId : match.teamBId) :
                                (match.choseTo === 'Bat' ? match.teamBId : match.teamAId);
          const bowlingTeam = battingTeam === match.teamAId ? match.teamBId : match.teamAId;

          const newLiveScorecard: Scorecard = {
              id: match.scorecardId,
              matchId: match.id,
              innings1: {
                  battingTeamId: battingTeam,
                  bowlingTeamId: bowlingTeam,
                  score: 0, wickets: 0, oversPlayed: 0, balls: []
              }
          };
          return simulateDelay(newLiveScorecard);
      }
  }
  return simulateDelay(scorecard);
};

export const updateScorecard = (scorecard: Scorecard): Promise<Scorecard> => {
  const index = scorecardsDB.findIndex(sc => sc.id === scorecard.id);
  if (index > -1) {
    scorecardsDB[index] = scorecard;
  } else {
    const newSc = { ...scorecard };
    if (!newSc.id && scorecard.matchId) newSc.id = \`sc_\${scorecard.matchId}\`; 
    else if (!newSc.id) newSc.id = generateId();

    scorecardsDB.push(newSc);
    const match = matchesDB.find(m => m.id === newSc.matchId);
    if (match && !match.scorecardId) {
        match.scorecardId = newSc.id;
    }
  }
  return simulateDelay(scorecard);
};


export const updateMatch = async (matchId: string, data: Partial<Match>): Promise<Match | undefined> => {
    const index = matchesDB.findIndex(m => m.id === matchId);
    if (index === -1) return simulateDelay(undefined);
    matchesDB[index] = { ...matchesDB[index], ...data };
    return simulateDelay(matchesDB[index]);
};


export const getPlayersForTeam = (teamId: string): Promise<Player[]> => {
    return simulateDelay(playersDB.filter(p => p.teamIds.includes(teamId)));
};