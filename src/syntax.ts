import type { Hex } from './color.ts';
import type { Palette, TokenName } from './tokens.ts';

type Style = { readonly foreground?: Hex; readonly fontStyle?: string };

export type TokenColor = {
  readonly name: string;
  readonly scope: readonly string[];
  readonly settings: Style;
};

type Rule = {
  readonly name: string;
  readonly token: TokenName;
  readonly fontStyle?: string;
  readonly scope: readonly string[];
};

// Later rules win ties in VS Code, so specific scopes come after general ones.
const rules: readonly Rule[] = [
  {
    name: 'Comment',
    token: '--syntax-comment',
    scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
  },
  {
    name: 'Keyword',
    token: '--syntax-keyword',
    scope: [
      'keyword',
      'keyword.control',
      'storage',
      'storage.type',
      'storage.modifier',
      'keyword.operator.new',
      'keyword.operator.expression',
      'keyword.operator.logical.python',
      'variable.language',
    ],
  },
  {
    name: 'Operator',
    token: '--syntax-operator',
    scope: [
      'keyword.operator',
      'punctuation.separator',
      'punctuation.terminator',
      'punctuation.accessor',
    ],
  },
  {
    name: 'String',
    token: '--syntax-string',
    scope: [
      'string',
      'punctuation.definition.string',
      'markup.inline.raw',
      'markup.fenced_code',
    ],
  },
  {
    name: 'Number',
    token: '--syntax-number',
    scope: ['constant.numeric'],
  },
  {
    name: 'Constant',
    token: '--syntax-constant',
    scope: [
      'constant.language',
      'constant.character',
      'constant.other',
      'support.constant',
      'variable.other.constant',
      'variable.other.enummember',
      'string.regexp',
    ],
  },
  {
    name: 'Function',
    token: '--syntax-function',
    scope: [
      'entity.name.function',
      'support.function',
      'meta.function-call.generic',
    ],
  },
  {
    name: 'Type',
    token: '--syntax-type',
    scope: [
      'entity.name.type',
      'entity.name.class',
      'entity.name.namespace',
      'entity.other.inherited-class',
      'support.type',
      'support.class',
      'storage.type.primitive',
    ],
  },
  {
    name: 'Property',
    token: '--syntax-property',
    scope: [
      'variable.other.property',
      'variable.other.object.property',
      'support.type.property-name',
      'meta.object-literal.key',
      'entity.other.attribute-name',
      'entity.name.tag.yaml',
    ],
  },
  {
    name: 'Tag',
    token: '--syntax-tag',
    scope: ['entity.name.tag', 'punctuation.definition.tag'],
  },
  {
    name: 'Decorator',
    token: '--syntax-decorator',
    scope: [
      'meta.decorator',
      'entity.name.function.decorator',
      'punctuation.decorator',
      'storage.type.annotation',
    ],
  },
  {
    name: 'Plain',
    token: '--syntax-plain',
    scope: ['variable', 'variable.parameter', 'meta.embedded'],
  },
  {
    name: 'Markdown heading',
    token: '--syntax-keyword',
    fontStyle: 'bold',
    scope: ['markup.heading', 'entity.name.section'],
  },
  {
    name: 'Markdown link',
    token: '--text-brand-secondary',
    scope: ['markup.underline.link', 'string.other.link'],
  },
  {
    name: 'Inserted',
    token: '--text-success-primary',
    scope: ['markup.inserted'],
  },
  {
    name: 'Deleted',
    token: '--text-error-primary',
    scope: ['markup.deleted'],
  },
  {
    name: 'Changed',
    token: '--text-warning-primary',
    scope: ['markup.changed'],
  },
  {
    name: 'Invalid',
    token: '--text-error-primary',
    scope: ['invalid', 'invalid.illegal'],
  },
];

const fontStyles: readonly TokenColor[] = [
  { name: 'Bold', scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
  {
    name: 'Italic',
    scope: ['markup.italic'],
    settings: { fontStyle: 'italic' },
  },
];

/** TextMate `tokenColors`, from Macaw's `--syntax-*` tokens. */
export function tokenColors(p: Palette): readonly TokenColor[] {
  return [
    ...rules.map(({ name, token, fontStyle, scope }) => ({
      name,
      scope,
      settings: {
        foreground: p.color(token),
        ...(fontStyle ? { fontStyle } : {}),
      },
    })),
    ...fontStyles,
  ];
}

/** Language-server semantic tokens, kept consistent with `tokenColors`. */
export function semanticTokenColors(p: Palette): Readonly<Record<string, Hex>> {
  const c = p.color;
  return {
    namespace: c('--syntax-type'),
    class: c('--syntax-type'),
    interface: c('--syntax-type'),
    enum: c('--syntax-type'),
    type: c('--syntax-type'),
    typeParameter: c('--syntax-type'),
    function: c('--syntax-function'),
    method: c('--syntax-function'),
    property: c('--syntax-property'),
    enumMember: c('--syntax-constant'),
    decorator: c('--syntax-decorator'),
    parameter: c('--syntax-plain'),
    variable: c('--syntax-plain'),
    'variable.defaultLibrary': c('--syntax-constant'),
  };
}
