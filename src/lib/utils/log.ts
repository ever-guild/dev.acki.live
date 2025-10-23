import { environment } from '$lib/environment';

export function log(message?: any, ...optionalParams: any[]) {
  environment.develop && console.log(message, ...optionalParams)
}
