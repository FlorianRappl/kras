// https://github.com/idflood/SocialLocale/blob/master/src/sociallocale.js
export default function (locale: string) {
  const parts = locale.split('-');

  // The first element is the language code
  switch (parts[0]) {
    // African
    case 'af':
      return 'af_ZA';

    // Amharic
    case 'am':
      return false;

    // Arabic
    case 'ar':
    // Arabic is generic, and html has many language subtags
    case 'aao':
    case 'abh':
    case 'abv':
    case 'acm':
    case 'acq':
    case 'acw':
    case 'acx':
    case 'acy':
    case 'adf':
    case 'aeb':
    case 'aec':
    case 'afb':
    case 'ajp':
    case 'apc':
    case 'apd':
    case 'arb':
    case 'arq':
    case 'ars':
    case 'ary':
    case 'arz':
    case 'auz':
    case 'avl':
    case 'ayh':
    case 'ayl':
    case 'ayn':
    case 'ayp':
    case 'bbz':
    case 'pga':
    case 'shu':
    case 'ssh':
      return 'ar_AR';

    // Azerbaijani
    case 'az':
    case 'azb':
    case 'azj':
      return 'az_AZ';

    // Belarusian
    case 'be':
      return 'be_BY';

    // Bulgarian
    case 'bg':
      return 'bg_BG';

    // Bengali
    case 'bn':
      return 'bn_IN';

    // Bosnian
    case 'bs':
      return 'bs_BA';

    // Catalan
    case 'ca':
      return 'ca_ES';

    // Czech
    case 'cs':
      return 'cs_CZ';

    // Welsh
    case 'cy':
      return 'cy_GB';

    // Danish
    case 'da':
      return 'da_DK';

    // German
    case 'de':
      return 'de_DE';

    // Greek
    case 'el':
      return 'el_GR';

    // English
    case 'en':
      if (parts.length > 1) {
        if (parts[1] === 'US' || parts[1] === 'GB' || parts[1] === 'PI' || parts[1] === 'UD') {
          return 'en_' + parts[1];
        }
      }
      return 'en_US';

    // Esperanto
    case 'eo':
      return 'eo_EO';

    // Spanish
    case 'es':
      if (parts.length > 1) {
        if (parts[1] === 'LA' || parts[1] === '419') {
          return 'es_LA';
        }
      }
      return 'es_ES';

    // Estonian
    case 'et':
    // ET is a macro language
    case 'ekk':
    case 'vro':
      return 'et_EE';

    // Basque
    case 'eu':
      return 'eu_ES';

    // Persian
    case 'fa':
    // Persian is a macro language
    case 'pes':
    case 'prs':
      return 'fa_IR';

    // Leet Speak
    // Facebook has "Leet Speak" support but not html.
    // In html fb is not a language code but it is used by fb
    case 'fb':
      return 'fb_LT';

    // Finnish
    case 'fi':
      return 'fi_FI';

    // Faroese
    case 'fo':
      return 'fo_FO';

    // French
    case 'fr':
      if (parts.length > 1) {
        if (parts[1] === 'CA') {
          return 'fr_' + parts[1];
        }
      }
      return 'fr_FR';

    // Frisian
    case 'fy':
      return 'fy_NL';

    // Irish
    case 'ga':
      return 'ga_IE';

    // Galician
    case 'gl':
      return 'gl_ES';

    // Gujarati
    case 'gu':
      return false;

    // Hebrew
    case 'he':
      return 'he_IL';

    // Hindi
    case 'hi':
      return 'hi_IN';

    // Croatian
    case 'hr':
      return 'hr_HR';

    // Hungarian
    case 'hu':
      return 'hu_HU';

    // Armenian
    case 'hy':
      return 'hy_AM';

    // Indonesian
    case 'id':
      return 'id_ID';

    // Icelandic
    case 'is':
      return 'is_IS';

    // Italian
    case 'it':
      return 'it_IT';

    // Japanese
    case 'ja':
      return 'ja_JP';

    // Georgian
    case 'ka':
      return 'ka_GE';

    // Khmer
    case 'km':
      return 'km_KH';

    // Kannada
    case 'kn':
      return false;

    // Korean
    case 'ko':
      return 'ko_KR';

    // Kurdish
    case 'ku':
    // Kurdish is a macro language
    case 'ckb':
    case 'kmr':
    case 'sdh':
      return 'ku_TR';

    // Latin
    case 'la':
      return 'la_VA';

    // Lithuanian
    case 'lt':
      return 'lt_LT';

    // Latvian
    case 'lv':
    // Latvian is generic, has two more subtags
    case 'ltg':
    case 'lvs':
      return 'lv_LV';

    // Macedonian
    case 'mk':
      return 'mk_MK';

    // Malayalam
    case 'ml':
      return 'ml_IN';

    // Marathi
    case 'mr':
      return false;

    // Malay
    case 'ms':
    // Malay is generic, and html has many language subtags
    // id is a subtag but is already catched by Indonesian
    case 'in':
    case 'bjn':
    case 'btj':
    case 'bve':
    case 'bvu':
    case 'coa':
    case 'dup':
    case 'hji':
    case 'jak':
    case 'jax':
    case 'kvb':
    case 'kvr':
    case 'kxd':
    case 'lce':
    case 'lcf':
    case 'liw':
    case 'max':
    case 'meo':
    case 'mfa':
    case 'mfb':
    case 'min':
    case 'mqg':
    case 'msi':
    case 'mui':
    case 'orn':
    case 'ors':
    case 'pel':
    case 'pse':
    case 'tmw':
    case 'urk':
    case 'vkk':
    case 'vkt':
    case 'xmm':
    case 'zlm':
    case 'zmi':
    case 'zsm':
      return 'ms_MY';

    // Norwegian (bokmal)
    case 'nb':
      return 'nb_NO';

    // Nepali
    case 'ne':
    // NE is a macrolanguage
    case 'dty':
    case 'npi':
      return 'ne_NP';

    // Dutch
    case 'nl':
      return 'nl_NL';

    // Norwegian (nynorsk)
    case 'nn':
      return 'nn_NO';

    // Punjabi
    case 'pa':
      return 'pa_IN';

    // Polish
    case 'pl':
      return 'pl_PL';

    // Pashto
    case 'ps':
    // PS is a macro language
    case 'pbt':
    case 'pbu':
    case 'pst':
      return 'ps_AF';

    // Portuguese
    case 'pt':
      if (parts.length > 1 && parts[1] === 'BR') {
        return 'pt_BR';
      }
      return 'pt_PT';

    // Romanian
    case 'ro':
      return 'ro_RO';

    // Russian
    case 'ru':
      return 'ru_RU';

    // Slovak
    case 'sk':
      return 'sk_SK';

    // Slovenian
    case 'sl':
      return 'sl_SI';

    // Albanian
    case 'sq':
    // SQ is a macro language
    case 'aae':
    case 'aat':
    case 'aln':
    case 'als':
      return 'sq_AL';

    // Serbian
    case 'sr':
      return 'sr_RS';

    // Swedish
    case 'sv':
      return 'sv_SE';

    // Swahili
    case 'sw':
    // SW is a macro language
    case 'swc':
    case 'swh':
      return 'sw_KE';

    // Tamil
    case 'ta':
      return 'ta_IN';

    // Telugu
    case 'te':
      return 'te_IN';

    // Thai
    case 'th':
      return 'th_TH';

    // Filipino
    case 'tl':
    case 'fil':
      return 'tl_PH';

    // Turkish
    case 'tr':
      return 'tr_TR';

    // Ukrainian
    case 'uk':
      return 'uk_UA';

    // Urdu
    case 'ur':
      return false;

    // Vietnamese
    case 'vi':
      return 'vi_VN';

    // Chinese
    case 'zh':
    // ZH is a macro language
    case 'cdo':
    case 'cjy':
    case 'cmn':
    case 'cpx':
    case 'czh':
    case 'czo':
    case 'gan':
    case 'hak':
    case 'hsn':
    case 'lzh':
    case 'mnp':
    case 'nan':
    case 'wuu':
    case 'yue':
      if (parts.length > 1) {
        if (parts[1] === 'HK' || parts[1] === 'TW') {
          return 'zh_' + parts[1];
        }
      }
      return 'zh_CN';

    // Zulu
    case 'zu':
      return false;

    // Return false if language code not supported by facebook
    default:
      return false;
  }
}
