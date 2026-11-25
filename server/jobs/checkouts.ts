import { finishPaidCheckouts, forgetAbandonedCheckouts } from '../repos/checkouts';
import type { JobRunner } from './index';

export const finishPayments: JobRunner = () => finishPaidCheckouts();
export const forgetCheckouts: JobRunner = () => forgetAbandonedCheckouts();
