/**
 * Common Type Definitions
 * Contains basic types reused throughout the system
 */

/**
 * Timestamp (milliseconds)
 */
export type Timestamp = number;

/**
 * Unique Identifier
 */
export type UUID = string;

/**
 * Signal Quality Enum
 */
export enum SignalQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

/**
 * Time Range
 */
export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}

/**
 * Data Point (Generic)
 */
export interface DataPoint<T> {
  timestamp: Timestamp;
  value: T;
  quality?: SignalQuality;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated Result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Operation Result
 */
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}
