import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const MATCH_WAITING_KEY = 'match-waiting';
export const MATCH_CANCELLED_KEY = 'match-cancelled';
export const SOCKET_USER_KEY = 'socket-user';
export const USER_SOCKET_KEY = 'user-socket';

export const MATCH_REQUEST = 'match-request';
export const MATCH_CATEGORY = 'match-category';