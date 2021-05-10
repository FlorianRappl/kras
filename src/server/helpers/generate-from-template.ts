import * as faker from 'faker';

function type(obj: any) {
  return Array.isArray(obj) ? 'array' : obj === null ? 'null' : typeof obj;
}

const randomNumbers = [
  0.021768910889510606, 0.23762323165420307, 0.9079616118204306, 0.6534305309997466, 0.22049697572443694,
  0.07687466163364898, 0.8017428775547905, 0.16165353264404825, 0.5124345671670483, 0.19337327636624613,
  0.39963994200698416, 0.8012592654139514, 0.22474962687229938, 0.9791396234452399, 0.7965428353317756,
  0.9777664340629622, 0.5135216702983731, 0.7407128236192145, 0.12880984991420075, 0.8186600800491484,
  0.5187691445438851, 0.034723021925916586, 0.5625092833040853, 0.02502838571997701, 0.663696305503698,
  0.3481608684353138, 0.8991623585175106, 0.3640542564277087, 0.8320766874121723, 0.012778915627689846,
  0.1427680370061336, 0.9774408289203956, 0.010229381207667587, 0.2596610885223093, 0.6150540104297127,
  0.7130773919030915, 0.8638338302974085, 0.6178483032907357, 0.980312844391733, 0.5007277415012348, 0.6348672031113127,
  0.4400097775503303, 0.8468458451408212, 0.38724997893647317, 0.690237920987028, 0.19850102297146477,
  0.44895115941315766, 0.22283381913760725, 0.031228117310125314, 0.3367510872581615, 0.28155752394210787,
  0.14696694832580504, 0.08164635161760991, 0.8837733477785624, 0.4590179148539142, 0.9613195413217465,
  0.11263127577456922, 0.743695635896287, 0.0002424891439143373, 0.1964622832546613, 0.7333363138878922,
  0.5575568682003356, 0.20426374168098604, 0.18030934250338893, 0.9792636408392759, 0.30121911048336913,
  0.7734906886720265, 0.6984051127767527, 0.6638058511379343, 0.3310956256388182, 0.36632372827973203,
  0.8996494702333895, 0.8235917663049763, 0.418496734118911, 0.8164648495097332, 0.9457831606354686, 0.2845227542117049,
  0.42374718399151545, 0.3431728911657228, 0.5289314006219973, 0.6029243600407113, 0.6528301140700757,
  0.6948768236197832, 0.7887302784092911, 0.8950274196119906, 0.6121642239166305, 0.31797481561514696,
  0.34903732589844216, 0.3580320092281766, 0.8312225728434115, 0.32331010157206974, 0.16395388672837796,
  0.6072960306003872, 0.6580526967999424, 0.23472961545632742, 0.6138637855489343, 0.3067303339060682,
  0.44935935129958315, 0.24729465243280668, 0.8244189715967711,
];

function rand() {
  const value = randomNumbers.shift();
  randomNumbers.push(value);
  return value;
}

// helpers
const helpers: any = {
  repeat(template: any, name = '') {
    const matches = name.match(/(\w+)\((\d+)(, *(\d+)?)?\)/);
    const lengthMin = parseInt(matches[2], 10);
    const lengthMax = parseInt(matches[4], 10);
    const length = (lengthMax > lengthMin ? Math.round(rand() * (lengthMax - lengthMin)) : 0) + lengthMin;
    const generated = [];

    for (let i = 0; i < length; i++) {
      generated.push(generateFromTemplate(template));
    }

    return generated;
  },
};

export function generateFromTemplate(template: any): any {
  switch (type(template)) {
    case 'array': {
      const generated = [];

      for (let i = 0; i < template.length; i++) {
        generated[i] = generateFromTemplate(template[i]);
      }

      return generated;
    }

    case 'object': {
      const generated: Record<string, any> = {};

      for (const p in template) {
        const matches = p.match(/(\w+)\((\d+)(, *(\d+)?)?\)/);
        const helper = (matches && matches[1]) || '';

        if (helper) {
          return helpers[helper](template[p], p);
        }

        generated[p] = generateFromTemplate(template[p]);
      }

      return generated;
    }

    case 'string': {
      if (template.match(/\{\{.+\}\}/)) {
        // Convert to normalize json format
        // e.g.
        // 1. {{random.number({'min': 1, 'max': 5, 'precision': 0.01})}} -> {{random.number({"min": 1, "max": 5, "precision": 0.01})}}
        // 2. {{helpers.randomize(['blue', 'brown'])}} -> {{helpers.randomize(["blue", "brown"])}}
        // 3. {{random.number({min: 1, max: 5, precision: 0.01})}} -> {{random.number({"min": 1, "max": 5, "precision": 0.01})}}
        // With the official support of single quotes, then can be removed: https://github.com/Marak/faker.js/issues/643
        template = template.replace(/(?<=(\{\{[^(\[{]+\())([\[{][^\]}]+[\]}])/gi, (parameter: string) =>
          // tslint:disable-next-line
          JSON.stringify(eval(`(${parameter})`)),
        );

        return faker.fake(template);
      }

      return template;
    }
    case 'number':
    case 'boolean':
    default:
      return template;
  }
}
