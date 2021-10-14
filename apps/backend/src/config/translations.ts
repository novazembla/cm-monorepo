import { setLocale } from "yup";

export interface i18nTranslationProps {
  path: string;
  type: string;
  value?: boolean;
  values?: any;
  unknown?: any;
  length?: number;
  less?: number;
  more?: number;
  min?: number | Date | string;
  max?: number | Date | string;
  regex?: RegExp;
}

// t('validation.notunique', "This valaue is not unique")

export let mixed = {
  // t('validation.mixed.default', 'This field is invalid')
  default: ({ path }: i18nTranslationProps) => ({
    key: "validation.mixed.default",
    values: { path },
  }),

  // t('validation.mixed.required', 'This field is required')
  required: ({ path }: i18nTranslationProps) => ({
    key: "validation.mixed.required",
    values: { path },
  }),

  // t('validation.mixed.oneOf', 'This field must be one of the following values: {{values}}')
  oneOf: ({ path, values }: i18nTranslationProps) => ({
    key: "validation.mixed.oneOf",
    values: { path, values },
  }),

  // t('validation.mixed.notOneOf', 'This field must not be one of the following values: {{values}}')
  notOneOf: ({ path, values }: i18nTranslationProps) => ({
    key: "validation.mixed.notOneOf",
    values: { path, values },
  }),

  // t('validation.mixed.notType', 'This field must not be of the type: {{type}}')
  notType: ({ path, type }: i18nTranslationProps) => ({
    key: "validation.mixed.notType",
    values: { path, type },
  }),

  // t('validation.mixed.defined', 'This field must be defined')
  defined: ({ path }: i18nTranslationProps) => ({
    key: "validation.mixed.defined",
    values: { path },
  }),
};

export let string = {
  // t('validation.string.length', 'This field must be exactly {{length}} characters long')
  length: ({ path, length }: i18nTranslationProps) => ({
    key: "validation.string.length",
    values: { path, length },
  }),

  // t('validation.string.min', 'This field must be at least {{min}} characters long')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.string.min",
    values: { path, min },
  }),

  // t('validation.string.max', 'This field must be at most {{max}} characters long')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.string.max",
    values: { path, max },
  }),

  // t('validation.string.matches', 'This field must match the following: "{{regex}}"')
  matches: ({ path, regex }: i18nTranslationProps) => ({
    key: "validation.string.matches",
    values: { path, regex },
  }),

  // t('validation.string.email', 'This field must be a valid email address')
  email: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.email",
    values: { path },
  }),

  // t('validation.string.url', 'This field must be a valid URL')
  url: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.url",
    values: { path },
  }),

  // t('validation.string.uuid', 'This field must be a valid UUID')
  uuid: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.uuid",
    values: { path },
  }),

  // t('validation.string.trim', 'This field must be a trimmed string')
  trim: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.trim",
    values: { path },
  }),

  // t('validation.string.lowercase', 'This field must be written in lower case only')
  lowercase: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.lowercase",
    values: { path },
  }),

  // t('validation.string.uppercase', 'This field must be written in upper case only')
  uppercase: ({ path }: i18nTranslationProps) => ({
    key: "validation.string.uppercase",
    values: { path },
  }),
};

export let number = {
  // t('validation.number.min', 'This field must be greater than or equal to {{min}}')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.number.min",
    values: { path, min },
  }),

  // t('validation.number.max', 'This field must be less than or equal to {{max}}')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.number.max",
    values: { path, max },
  }),

  // t('validation.number.lessThan', 'This field must be less than {{less}}')
  lessThan: ({ path, less }: i18nTranslationProps) => ({
    key: "validation.number.lessThan",
    values: { path, less },
  }),

  // t('validation.number.moreThan', 'This field must be greater than {{more}}')
  moreThan: ({ path, more }: i18nTranslationProps) => ({
    key: "validation.number.moreThan",
    values: { path, more },
  }),

  // t('validation.number.positive', 'This field must be a positive number')
  positive: ({ path }: i18nTranslationProps) => ({
    key: "validation.number.positive",
    values: { path },
  }),

  // t('validation.number.negative', 'This field must be a negative number')
  negative: ({ path }: i18nTranslationProps) => ({
    key: "validation.number.negative",
    values: { path },
  }),

  // t('validation.number.integer', 'This field must be an integer')
  integer: ({ path }: i18nTranslationProps) => ({
    key: "validation.number.integer",
    values: { path },
  }),
};

export let date = {
  // t('validation.date.min', 'This field must be later than {{min}}')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.date.min",
    values: { path, min },
  }),

  // t('validation.date.max', 'This field must be at earlier than {{max}}')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.date.max",
    values: { path, max },
  }),
};

export let boolean = {
  // t('validation.boolean.isValue', 'This field must be {{value}}')
  isValue: ({ path, value }: i18nTranslationProps) => ({
    key: "validation.boolean.isValue",
    values: { path, value },
  }),
};

export let object = {
  // t('validation.object.noUnknown', 'This field field has unspecified keys: {{unknown}}')
  noUnknown: ({ path, unknown }: i18nTranslationProps) => ({
    key: "validation.object.noUnknown",
    values: { path, unknown },
  }),
};

export let array = {
  // t('validation.array.min', 'Please select at least {{min}} item')
  min: ({ path, min }: i18nTranslationProps) => ({
    key: "validation.array.min",
    values: { path, min },
  }),

  // t('validation.array.max', 'You can only select less than or equal to {{max}} items')
  max: ({ path, max }: i18nTranslationProps) => ({
    key: "validation.array.max",
    values: { path, max },
  }),

  // t('validation.array.length', 'Please select {{length}} item(s)')
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
