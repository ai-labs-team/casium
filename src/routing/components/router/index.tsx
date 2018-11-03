import { isEmpty } from 'ramda';
import * as React from 'react';
import { Container, withProps } from '../../../index';

type ComponentMap = {
  [key: string]: React.ComponentType | Container<{}>
};

type RouterProps<T extends ComponentMap, K extends keyof T> = {
  components?: K[];
  componentMap: T;
};

type Mapped = {
  Component: typeof React.Component;
};

// tslint:disable-next-line:variable-name
const Router: <T extends ComponentMap, K extends keyof T>(props: RouterProps<T, K>) => React.ReactElement<any> =
  withProps(
    {
      Component: ({ components, componentMap }) => (
        // We need a 404 page
        componentMap[components[0]] || componentMap.SignInPage
      ),
    },
    <T extends ComponentMap, K extends keyof T>({
      Component,
      components,
      componentMap,
      ...props
    }: RouterProps<T, K> & Mapped) => (
      <Component {...props}>
        {!isEmpty(components.slice(1))
          && <Router components={components.slice(1)} {...{ componentMap, ...props }} />}
      </Component>
    )
  );

export default Router;
