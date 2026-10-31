import { OpenAPIHono } from '@hono/zod-openapi';

//route imports
import authRoutes from './modules/auth/auth.routes';
import healthRouter from "@/modules/health/health.routes";
import userRoutes from './modules/user/user.routes';
import WalletRoutes from './modules/wallet/wallet.routes';
import { sportsRoutes, adminSportsRoutes } from './modules/sports/sports.routes';
import { teamsRoutes,adminTeamsRoutes} from '@/modules/teams/teams.routes';
import { tournamentsRoute, adminTournamentsRoute } from './modules/tournaments/tournaments.routes';
import { contestsRoutes, adminContestsRoutes } from './modules/contests/contests.routes';
import { matchesRoutes, adminMatchesRoutes } from './modules/matches/matches.route';

export function registerRoutes(app: OpenAPIHono) {
  //health routee
  app.route("/", healthRouter);

  //auth routes
  app.route("/api/auth", authRoutes);

  //user routes
  app.route("/api/user", userRoutes);

  //wallet routes
  app.route("/api/wallet", WalletRoutes);

  //Sports routes
  app.route("/api/sports", sportsRoutes);
  app.route("/api/admin/sports", adminSportsRoutes);

  //Teams routes
  app.route("/api/teams", teamsRoutes);
  app.route("/api/admin/teams", adminTeamsRoutes);

  //Tournaments routes
  app.route("/api/tournaments", tournamentsRoute);
  app.route("/api/admin/tournaments", adminTournamentsRoute);

  //contests routes
  app.route('/api/contests', contestsRoutes)
  app.route ('/api/admin/contests', adminContestsRoutes)

 //matches routes
 app.route('/api/matches', matchesRoutes)
 app.route('/api/admin/matches', adminMatchesRoutes)
  
}
