import { exec } from 'child_process';
import { AppConfig } from './app.config';

export class AppUtil {

  public static async dockerComposeStart(): Promise<string> {
    return this.execShellCommand(`docker-compose -f ${AppConfig.dockerComposePath} start`);
  }

  public static async dockerComposeStop(): Promise<string> {
    return this.execShellCommand(`docker-compose -f ${AppConfig.dockerComposePath} stop`);
  }

  public static async delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => resolve(), ms);
    });
  }

  private static execShellCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        return resolve(stdout ? stdout : stderr);
      });
    });
  }
}