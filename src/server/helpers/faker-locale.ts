export default function(locale, type) {
      var parts = locale.split("-");
      var GOOGLE = (type === "google");
      var TWITTER = (type === "twitter");

      // The first element is the language code
      switch (parts[0]) {
        // African
        case "af":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "af";
          }
          return "af_ZA";

        // Amharic
        case "am":
          if (GOOGLE) {
            return "am";
          }
          return false;

        // Arabic
        case "ar":
        // Arabic is generic, and html has many language subtags
        case "aao":
        case "abh":
        case "abv":
        case "acm":
        case "acq":
        case "acw":
        case "acx":
        case "acy":
        case "adf":
        case "aeb":
        case "aec":
        case "afb":
        case "ajp":
        case "apc":
        case "apd":
        case "arb":
        case "arq":
        case "ars":
        case "ary":
        case "arz":
        case "auz":
        case "avl":
        case "ayh":
        case "ayl":
        case "ayn":
        case "ayp":
        case "bbz":
        case "pga":
        case "shu":
        case "ssh":
          if (GOOGLE || TWITTER) {
            return "ar";
          }
          return "ar_AR";

        // Azerbaijani
        case "az":
        case "azb":
        case "azj":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "az_AZ";

        // Belarusian
        case "be":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "be_BY";

        // Bulgarian
        case "bg":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "bg";
          }
          return "bg_BG";

        // Bengali
        case "bn":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "bn";
          }
          return "bn_IN";

        // Bosnian
        case "bs":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "bs_BA";

        // Catalan
        case "ca":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "ca";
          }
          return "ca_ES";

        // Czech
        case "cs":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "cz";
          }
          return "cs_CZ";

        // Welsh
        case "cy":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "cy_GB";

        // Danish
        case "da":
          if (GOOGLE || TWITTER) {
            return "da";
          }
          return "da_DK";

        // German
        case "de":
          if (GOOGLE || TWITTER) {
            return "de";
          }
          return "de_DE";

        // Greek
        case "el":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "el";
          }
          return "el_GR";

        // English
        case "en":
          if (TWITTER) {
            return "en";
          }
          if (GOOGLE) {
            if (parts.length > 1 && parts[1] === "GB") {
              return "en-GB";
            }
            return "en-US";
          }

          if (parts.length > 1) {
            if (parts[1] === "US" || parts[1] === "GB" || parts[1] === "PI" || parts[1] === "UD") {
              return "en_" + parts[1];
            }
          }
          return "en_US";

        // Esperanto
        case "eo":
          if (GOOGLE) {
            return false;
          }
          return "eo_EO";

        // Spanish
        case "es":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            if ((parts.length > 1) ) {
              if (parts[1] === "LA" || parts[1] === "419") {
                return "es-419";
              }
            }
            return "es";
          }
          if ((parts.length > 1) ) {
            if (parts[1] === "LA" || parts[1] === "419") {
              return "es_LA";
            }
          }
          return "es_ES";

        // Estonian
        case "et":
        // ET is a macro language
        case "ekk":
        case "vro":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "et";
          }
          return "et_EE";

        // Basque
        case "eu":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "eu";
          }
          return "eu_ES";

        // Persian
        case "fa":
        // Persian is a macro language
        case "pes":
        case "prs":
          if (GOOGLE || TWITTER) {
            return "fa";
          }
          return "fa_IR";

        // Leet Speak
        // Facebook has "Leet Speak" support but not html.
        // In html fb is not a language code but it is used by fb
        case "fb":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "fb_LT";

        // Finnish
        case "fi":
          if (GOOGLE || TWITTER) {
            return "fi";
          }
          return "fi_FI";

        // Faroese
        case "fo":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "fo_FO";

        // French
        case "fr":
          if (TWITTER) {
            return "fr";
          }
          if (GOOGLE) {
            if (parts.length > 1) {
              if (parts[1] === "CA") {
                return "fr-CA";
              }
            }
            return "fr";
          }
          if (parts.length > 1) {
            if (parts[1] === "CA") {
              return "fr_" + parts[1];
            }
          }
          return "fr_FR";

        // Frisian
        case "fy":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "fy_NL";

        // Irish
        case "ga":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "ga_IE";

        // Galician
        case "gl":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "gl";
          }
          return "gl_ES";

        // Gujarati
        case "gu":
          if (GOOGLE) {
            return "gu";
          }
          return false;

        // Hebrew
        case "he":
          if (TWITTER) {
            return "he";
          }
          if (GOOGLE) {
            return "iw";
          }
          return "he_IL";

        // Hindi
        case "hi":
          if (GOOGLE || TWITTER) {
            return "hi";
          }
          return "hi_IN";

        // Croatian
        case "hr":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "hr";
          }
          return "hr_HR";

        // Hungarian
        case "hu":
          if (GOOGLE || TWITTER) {
            return "hu";
          }
          return "hu_HU";

        // Armenian
        case "hy":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "hy_AM";

        // Indonesian
        case "id":
          if (GOOGLE || TWITTER) {
            return "id";
          }
          return "id_ID";

        // Icelandic
        case "is":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "is";
          }
          return "is_IS";

        // Italian
        case "it":
          if (GOOGLE || TWITTER) {
            return "it";
          }
          return "it_IT";

        // Japanese
        case "ja":
          if (GOOGLE || TWITTER) {
            return "ja";
          }
          return "ja_JP";

        // Georgian
        case "ka":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "ka_GE";

        // Khmer
        case "km":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "km_KH";

        // Kannada
        case "kn":
          if (GOOGLE || TWITTER) {
            return "kn";
          }
          return false;

        // Korean
        case "ko":
          if (GOOGLE || TWITTER) {
            return "ko";
          }
          return "ko_KR";

        // Kurdish
        case "ku":
        // Kurdish is a macro language
        case "ckb":
        case "kmr":
        case "sdh":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "ku_TR";

        // Latin
        case "la":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "la_VA";

        // Lithuanian
        case "lt":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "lt";
          }
          return "lt_LT";

        // Latvian
        case "lv":
        // Latvian is generic, has two more subtags
        case "ltg":
        case "lvs":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "lv";
          }
          return "lv_LV";

        // Macedonian
        case "mk":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "mk_MK";

        // Malayalam
        case "ml":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "ml";
          }
          return "ml_IN";

        // Marathi
        case "mr":
          if (GOOGLE) {
            return "mr";
          }
          return false;

        // Malay
        case "ms":
        // Malay is generic, and html has many language subtags
        // id is a subtag but is already catched by Indonesian
        case "in":
        case "bjn":
        case "btj":
        case "bve":
        case "bvu":
        case "coa":
        case "dup":
        case "hji":
        case "jak":
        case "jax":
        case "kvb":
        case "kvr":
        case "kxd":
        case "lce":
        case "lcf":
        case "liw":
        case "max":
        case "meo":
        case "mfa":
        case "mfb":
        case "min":
        case "mqg":
        case "msi":
        case "mui":
        case "orn":
        case "ors":
        case "pel":
        case "pse":
        case "tmw":
        case "urk":
        case "vkk":
        case "vkt":
        case "xmm":
        case "zlm":
        case "zmi":
        case "zsm":
          if (TWITTER) {
            return "msa";
          }
          if (GOOGLE) {
            return "ms";
          }
          return "ms_MY";

        // Norwegian (bokmal)
        case "nb":
          if (GOOGLE || TWITTER) {
            return "no";
          }
          return "nb_NO";

        // Nepali
        case "ne":
        // NE is a macrolanguage
        case "dty":
        case "npi":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "ne_NP";

        // Dutch
        case  "nl":
          if (GOOGLE || TWITTER) {
            return "nl";
          }
          return "nl_NL";

        // Norwegian (nynorsk)
        case "nn":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "nn_NO";

        // Punjabi
        case "pa":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "pa_IN";

        // Polish
        case "pl":
          if (GOOGLE || TWITTER) {
            return "pl";
          }
          return "pl_PL";

        // Pashto
        case "ps":
        // PS is a macro language
        case "pbt":
        case "pbu":
        case "pst":
          if (GOOGLE) {
            return false;
          }
          return "ps_AF";

        // Portuguese
        case "pt":
          if (TWITTER) {
            return "pt";
          }
          if (GOOGLE) {
            if (parts.length > 1 && parts[1] === "BR") {
              return "pt-BR";
            }
            return "pt-PT";
          }
          if ((parts.length > 1) && parts[1] === "BR") {
            return "pt_BR";
          }
          return "pt_PT";

        // Romanian
        case "ro":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "ro";
          }
          return "ro_RO";

        // Russian
        case "ru":
          if (GOOGLE || TWITTER) {
            return "ru";
          }
          return "ru_RU";

        // Slovak
        case "sk":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "sk";
          }
          return "sk_SK";

        // Slovenian
        case "sl":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "sl";
          }
          return "sl_SI";

        // Albanian
        case "sq":
        // SQ is a macro language
        case "aae":
        case "aat":
        case "aln":
        case "als":
          if (GOOGLE || TWITTER) {
            return false;
          }
          return "sq_AL";

        // Serbian
        case "sr":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "sr";
          }
          return "sr_RS";

        // Swedish
        case "sv":
          if (GOOGLE || TWITTER) {
            return "sv";
          }
          return "sv_SE";

        // Swahili
        case "sw":
        // SW is a macro language
        case "swc":
        case "swh":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "sw";
          }
          return "sw_KE";

        // Tamil
        case "ta":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "ta";
          }
          return "ta_IN";

        // Telugu
        case "te":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "te";
          }
          return "te_IN";

        // Thai
        case "th":
          if (GOOGLE || TWITTER) {
            return "th";
          }
          return "th_TH";

        // Filipino
        // Todo: check this...
        // google and twitter accept Filipino language
        // facebook tagalog ?
        case "tl":
        case "fil":
          if (GOOGLE || TWITTER) {
            return "fil";
          }
          return "tl_PH";

        // Turkish
        case "tr":
          if (GOOGLE || TWITTER) {
            return "tr";
          }
          return "tr_TR";

        // Ukrainian
        case "uk":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "uk";
          }
          return "uk_UA";

        // Urdu
        case "ur":
          if (GOOGLE || TWITTER) {
            return "ur";
          }
          return false;

        // Vietnamese
        case "vi":
          if (TWITTER) {
            return false;
          }
          if (GOOGLE) {
            return "vi";
          }
          return "vi_VN";

        // Chinese
        case "zh":
        // ZH is a macro language
        case "cdo":
        case "cjy":
        case "cmn":
        case "cpx":
        case "czh":
        case "czo":
        case "gan":
        case "hak":
        case "hsn":
        case "lzh":
        case "mnp":
        case "nan":
        case "wuu":
        case "yue":
          if (TWITTER) {
            if (parts.length > 1) {
              if (parts[1] === "TW") {
                return "zh-tw";
              }
            }
            return "zh-cn";
          }
          if (GOOGLE) {
            if (parts.length > 1) {
              if (parts[1] === "HK" || parts[1] === "TW") {
                return "zh-" + parts[1];
              }
            }
            return "zh-CN";
          }

          if (parts.length > 1) {
            if (parts[1] === "HK" || parts[1] === "TW") {
              return "zh_" + parts[1];
            }
          }
          return "zh_CN";

        // Zulu
        case "zu":
          if (GOOGLE) {
            return "zu";
          }
          return false;

        // Return false if language code not supported by facebook
        default:
          return false;
      }
    }
