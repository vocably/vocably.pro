import 'zx/globals';
import { packagesDir, rootDir } from './helpers/dirs.mjs';

const latestZipUrl =
  'http://vocably-prod-artifacts.s3-website.eu-central-1.amazonaws.com/latest.zip';
const safariExtensionDir = `${packagesDir}/safari-extension`;
const envPath = `${safariExtensionDir}/.env`;
const distDir = `${safariExtensionDir}/dist`;
const safariDir = `${rootDir}/safari-web-extension`;
const resourcesDir = `${safariDir}/Vocably/Vocably Extension/Resources`;

const getLatestVersion = async () => {
  const tmpDir = await fs.mkdtemp(`${os.tmpdir()}/vocably-safari-bump-`);
  const zipPath = `${tmpDir}/latest.zip`;

  try {
    console.log(`Downloading ${latestZipUrl}...`);
    await $`curl -sSfL -o ${zipPath} ${latestZipUrl}`;
    const manifest = (await $`unzip -p ${zipPath} manifest.json`).stdout;
    return JSON.parse(manifest).version;
  } finally {
    await fs.remove(tmpDir);
  }
};

const latestVersion = await getLatestVersion();
const currentVersion = (await fs.readJson(`${resourcesDir}/manifest.json`))
  .version;

console.log(
  `Setting VERSION=${latestVersion} in ${path.relative(rootDir, envPath)}...`
);
const env = await fs.readFile(envPath, 'utf8');
await fs.writeFile(
  envPath,
  env.replace(/^VERSION=.*$/m, `VERSION="${latestVersion}"`)
);

console.log(`Building @vocably/safari-extension...`);
await within(async () => {
  cd(safariExtensionDir);
  await $`npm run build`;
});

console.log(`Copying the extension files to the Safari project...`);
await fs.copy(distDir, resourcesDir, { overwrite: true });

console.log(`Bumping ${currentVersion} → ${latestVersion}...`);
const files = (
  await $`grep -rl --binary-files=without-match --fixed-strings ${currentVersion} ${safariDir} --exclude-dir=Vocably.app --exclude-dir=xcuserdata --exclude-dir=Resources --exclude=*.zip --exclude=*.pkg`.nothrow()
).stdout
  .split('\n')
  .filter((file) => file.trim() !== '');

for (const file of files) {
  const content = await fs.readFile(file, 'utf8');
  await fs.writeFile(file, content.split(currentVersion).join(latestVersion));
  console.log(`  ${path.relative(rootDir, file)}`);
}

console.log(`Done. The Safari extension is now at ${latestVersion}.`);
