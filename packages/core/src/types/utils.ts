/**
 * Check if {@link T} is `never`
 *
 * @param T - Type to check
 * @returns `true` if {@link T} is `never`, otherwise `false`
 *
 * @example
 * type Result = IsNever<'foo'>
 */
export type IsNever<T> = [T] extends [never] ? true : false

/**
 * Checks if {@link T} is `unknown`
 *
 * @param T - Type to check
 * @returns `true` if {@link T} is `unknown`, otherwise `false`
 *
 * @example
 * type Result = IsUnknown<unknown>
 */
export type IsUnknown<T> = unknown extends T ? true : false

/**
 * Joins {@link Items} into string separated by {@link Separator}
 *
 * @param Items - Items to join
 * @param Separator - Separator to use
 *
 * @example
 * type Result = Join<['foo', 'bar'], '-'>
 */
export type Join<
  Items extends string[],
  Separator extends string | number,
> = Items extends [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends string[]
      ? Rest extends []
        ? `${First}`
        : `${First}${Separator}${Join<Rest, Separator>}`
      : never
    : never
  : ''

/**
 * Check if {@link T} and {@link U} are equal
 *
 * @param T
 * @param U
 * @returns `true` if {@link T} and {@link U} are not equal, otherwise `false`
 *
 * @example
 * type Result = NotEqual<'foo', 'bar'>
 */
export type NotEqual<T, U> = [T] extends [U] ? false : true

/**
 * Convert {@link TKeys} of {@link TObject} to optional properties
 *
 * @param TObject
 * @param TKeys
 * @returns {@link TObject} with {@link TKeys} converted to optional properties
 *
 * @example
 * type Result = Optional<{ foo: string; bar: number }, 'foo'>
 */
export type Optional<TObject, TKeys extends keyof TObject> = {
  [K in keyof TObject as K extends TKeys ? never : K]: TObject[K]
} & {
  [K in keyof TObject as K extends TKeys ? K : never]?: TObject[K]
}

/**
 * Boolean "or" operator
 *
 * @param T
 * @param U
 * @returns `true` if either {@link T} or {@link U} are `true`, otherwise `false`
 *
 * @example
 * type Result = Or<true, false>
 */
export type Or<T, U> = T extends true ? true : U extends true ? true : false

export type ArrayOmit<T extends unknown[], E> = T['length'] extends 0
  ? []
  : T extends [infer THead, ...infer TRest]
  ? THead extends E
    ? ArrayOmit<TRest, E>
    : [THead, ...ArrayOmit<TRest, E>]
  : never

declare const __VALUE_TO_OMIT__: unique symbol
export type __VALUE_TO_OMIT__ = typeof __VALUE_TO_OMIT__
export type Count<T extends readonly unknown[], E> = ArrayOmit<
  [
    ...{
      [K in keyof T]: T[K] extends E ? T[K] : __VALUE_TO_OMIT__
    },
  ],
  __VALUE_TO_OMIT__
>['length']

export type UnionToIntersection<Union> = (
  Union extends unknown ? (arg: Union) => unknown : never
) extends (arg: infer R) => unknown
  ? R
  : never

export type ExpandObject<TObject> = TObject extends infer O
  ? { [K in keyof O]: O[K] }
  : never
