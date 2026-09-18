import 'zx/globals';
import { rootDir } from './helpers/dirs.mjs';

const latestZipUrl =
  'http://vocably-prod-artifacts.s3-website.eu-central-1.amazonaws.com/latest.zip';
const safariDir = `${rootDir}/safari-web-extension`;
const resourcesDir = `${safariDir}/Vocably/Vocably Extension/Resources`;

const tmpDir = await fs.mkdtemp(`${os.tmpdir()}/vocably-safari-bump-`);
const zipPath = `${tmpDir}/latest.zip`;
const unzippedDir = `${tmpDir}/latest`;

try {
  console.log(`Downloading ${latestZipUrl}...`);
  await $`curl -sSfL -o ${zipPath} ${latestZipUrl}`;
  await $`unzip -q -o ${zipPath} -d ${unzippedDir}`;

  const latestVersion = (await fs.readJson(`${unzippedDir}/manifest.json`))
    .version;
  const currentVersion = (await fs.readJson(`${resourcesDir}/manifest.json`))
    .version;

  console.log(`Copying the extension files to the Safari project...`);
  await fs.copy(unzippedDir, resourcesDir, {
    overwrite: true,
    filter: (src) => path.basename(src) !== 'manifest.json',
  });

  if (currentVersion === latestVersion) {
    console.log(`The Safari extension is already at ${latestVersion}.`);
  } else {
    console.log(`Bumping ${currentVersion} → ${latestVersion}...`);
    const files = (
      await $`grep -rl --binary-files=without-match --fixed-strings ${currentVersion} ${safariDir} --exclude-dir=Vocably.app --exclude-dir=xcuserdata --exclude=*.zip --exclude=*.pkg`.nothrow()
    ).stdout
      .split('\n')
      .filter((file) => file.trim() !== '');

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      await fs.writeFile(
        file,
        content.split(currentVersion).join(latestVersion)
      );
      console.log(`  ${path.relative(rootDir, file)}`);
    }

    console.log(`Done. The Safari extension is now at ${latestVersion}.`);
  }
} finally {
  await fs.remove(tmpDir);
}
