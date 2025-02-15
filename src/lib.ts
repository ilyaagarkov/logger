import {
  createNode,
  is,
  step,
  Domain,
  Scope,
  CompositeName,
  Unit, Node,
} from 'effector';

export const LOGGER_DOMAIN_NAME = '@effector-logger';

export function createName(composite: CompositeName): string {
  return composite.path.filter((name) => name !== LOGGER_DOMAIN_NAME).join('/');
}

export function getPath(unit: Unit<any>): string {
  return (unit as any).defaultConfig?.loc?.file ?? ' ';
}

function watchDomain(
  unit: Unit<any>,
  domain: Domain,
  fn: (payload: any) => any,
): void {
  if (is.store(unit)) {
    fn(unit.getState());
  }
  const watchUnit = is.store(unit) ? unit.updates : unit;
  (watchUnit as any).watch(fn);
}

function watchScope(
  unit: Unit<any>,
  scope: Scope,
  fn: (payload: any) => any,
): void {
  if (is.store(unit)) {
    fn(scope.getState(unit));
  }
  const node = createNode({
    node: [step.run({ fn })]
  });
  const watchUnit = is.store(unit) ? unit.updates : unit;
  const id = (watchUnit as any).graphite.id;
  const links: Node[] = ((scope as any).additionalLinks[id] =
    (scope as any).additionalLinks[id] || []);
  links.push(node);
}

export function watch(
  unit: Unit<any>,
  source: Domain | Scope,
  fn: (payload: any) => any,
): void {
  if (is.domain(source)) {
    watchDomain(unit, source, fn);
  } else {
    watchScope(unit, source, fn);
  }
}
