import { setLocale } from "yup";

export interface i18nTranslationProps {
  path: string;
  value?: boolean;
  values?: any;
  unknown?: any;
  length?: number;
  less?: number;
  more?: number;
  min?: number;
  max?: number;
  regex?: RegExp;
}

export let mixed = {
  // t('validation.mixed.default', '{{path}} is invalid')
  default: ({ path }: i18nTranslationProps) => ({
    key: "validation.mixed.default",
    values: { path },
  }),

  // t('validation.mixed.required', '{{path}} is a required field')
  required: ({ path }: i18nTranslationProps) => ({
    key: "validation.mixed.required",
    values: { path },
  }),

  // t('validation.mixed.oneOf', '{{path}} must be one of the following values: {{values}}')
  oneOf: ({ path, values }: i18nTranslationProps) => ({
    key: "validation.mixed.oneOf",
    values: { path, values },
  }),

  // t('validation.mixed.notOneOf', '{{path}} must not be one of the following values: {{values}}')
  notOneOf: ({ path, values }: i18nTranslationProps) => ({
    key: "validation.mixed.notOneOf",
    values: { path, values },
  }),

  // t('validation.mixed.defined', '{{path}} must be defined')
  defined: ({ path }: i18nTranslationProps) => ({
    key: "validation.mixed.defined",
    values: { path },
  }),
};

export let string = {
  // t('validation.string.length', '{{path}} must be exactly {{length}} characters long')
  length: ({ path, length }: i18nTranslationProps) => ({
    key: "validation.string.length",
    values: { path, length },
  }),

  // t('validation.string.min', '{{path}} must be at least {{min}} characters long')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.string.min",
    values: { path, min },
  }),

  // t('validation.string.max', '{{path}} must be at most {{max}} characters long')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.string.max",
    values: { path, max },
  }),

  // t('validation.string.matches', '{{path}} must match the following: "{{regex}}"')
  matches: ({ path, regex }: i18nTranslationProps) => ({
    key: "validation.string.matches",
    values: { path, regex },
  }),

  // t('validation.string.email', '{{path}} must be a valid email address')
  email: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.email",
    values: { path },
  }),

  // t('validation.string.url', '{{path}} must be a valid URL')
  url: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.url",
    values: { path },
  }),

  // t('validation.string.uuid', '{{path}} must be a valid UUID')
  uuid: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.uuid",
    values: { path },
  }),

  // t('validation.string.trim', '{{path}} must be a trimmed string')
  trim: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.trim",
    values: { path },
  }),

  // t('validation.string.lowercase', '{{path}} must be a lowercase string')
  lowercase: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.lowercase",
    values: { path },
  }),

  // t('validation.string.uppercase', '{{path}} must be a upper case string')
  uppercase: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.uppercase",
    values: { path },
  }),
};

export let number = {
  // t('validation.number.min', '{{path}} must be greater than or equal to {{min}}')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.number.min",
    values: { path, min },
  }),

  // t('validation.number.max', '{{path}} must be less than or equal to {{max}}')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.number.max",
    values: { path, max },
  }),

  // t('validation.number.lessThan', '{{path}} must be less than {{less}}')
  lessThan: ({ path, less }: i18nTranslationProps) => ({
    key: "validation.number.lessThan",
    values: { path, less },
  }),

  // t('validation.number.moreThan', '{{path}} must be greater than {{more}}')
  moreThan: ({ path, more }: i18nTranslationProps) => ({
    key: "validation.number.moreThan",
    values: { path, more },
  }),

  // t('validation.number.positive', '{{path}} must be a positive number')
  positive: ({ path }: i18nTranslationProps) => ({
    key: "validation.number.positive",
    values: { path },
  }),

  // t('validation.number.negative', '{{path}} must be a negative number')
  negative: ({ path }: i18nTranslationProps) => ({
    key: "validation.number.negative",
    values: { path },
  }),

  // t('validation.number.integer', '{{path}} must be an integer')
  integer: ({ path }: i18nTranslationProps) => ({
    key: "validation.number.integer",
    values: { path },
  }),
};

export let date = {
  // t('validation.date.min', '{{path}} field must be later than {{min}}')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.date.min",
    values: { path, min },
  }),

  // t('validation.date.max', '{{path}} field must be at earlier than {{max}}')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.date.max",
    values: { path, max },
  }),
};

export let boolean = {
  // t('validation.boolean.isValue', '{{path}} field must be {{value}}')
  isValue: ({ path, value }: i18nTranslationProps) => ({
    key: "validation.boolean.isValue",
    values: { path, value },
  }),
};

export let object = {
  // t('validation.object.noUnknown', '{{path}} field has unspecified keys: {{unknown}}')
  noUnknown: ({ path, unknown }: i18nTranslationProps) => ({
    key: "validation.object.noUnknown",
    values: { path, unknown },
  }),
};

export let array = {
  // t('validation.array.min', '{{path}} field must have at least {{min}} items')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.array.min",
    values: { path, min },
  }),

  // t('validation.array.max', '{{path}} field must have less than or equal to {{max}} items')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.array.max",
    values: { path, max },
  }),

  // t('validation.array.length', '{{path}} must have {{length}} items')
  length: ({ path, length }: i18nTranslationProps) => ({
    key: "validation.array.length",
    values: { path, length },
  }),
};

setLocale({
  mixed,
  string,
  number,
  date,
  object,
  array,
  boolean,
});
