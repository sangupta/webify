import { resolveConfig } from "./config";
import { generateBlog } from "./engine";

console.log('Preparing to generate blog...\n');
const start = Date.now();
try {
    // read process args
    const args = process.argv.slice(2);

    // get base path for the config file
    const configFile = resolveConfig(args);

    // generate blog
    await generateBlog(configFile);
    const end = Date.now();
    console.log('Blog generated successfully in ' + (end - start) + ' millis');

} catch (e) {
    console.error('Error generating blog: ', e);
}
