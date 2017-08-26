/* eslint-disable react/no-multi-comp */
import React from 'react';
import { compose } from 'recompose';
import { mount } from 'enzyme';

const dummyCallbacks = () => () => {};

describe('withResizeObserverProps', () => {
  describe('Resize Observer API is supported', () => {
    const Target = ({ onRef }) => {
      onRef('ref');

      return null;
    };

    let withResizeObserverProps = null;
    let origResizeObserver = null;

    beforeAll(() => {
      origResizeObserver = global.ResizeObserver;
    });

    beforeEach(() => {
      jest.resetModules();

      global.ResizeObserver = () => ({
        observe: () => {},
        unobserve: () => {}
      });
      withResizeObserverProps = require('../src/').default;
    });

    afterAll(() => {
      global.ResizeObserver = origResizeObserver;
    });

    it('should register observer with DOM node from `onRef`', () => {
      const mockObserve = jest.fn();

      global.ResizeObserver = jest.fn(() => ({
        observe: mockObserve
      }));

      const EnhancedTarget = withResizeObserverProps(dummyCallbacks)(Target);

      mount(
        <EnhancedTarget/>
      );

      expect(global.ResizeObserver.mock.calls).toMatchSnapshot();
      expect(mockObserve.mock.calls).toMatchSnapshot();
    });

    it('should register observer with DOM node from `onRef` with a custom handler name', () => {
      const CustomTarget = ({ onMyRef }) => {
        onMyRef('my-ref');

        return null;
      };
      const mockObserve = jest.fn();

      global.ResizeObserver = jest.fn(() => ({
        observe: mockObserve
      }));

      const EnhancedCustomTarget = withResizeObserverProps(dummyCallbacks, 'onMyRef')(CustomTarget);

      mount(
        <EnhancedCustomTarget/>
      );

      expect(global.ResizeObserver.mock.calls).toMatchSnapshot();
      expect(mockObserve.mock.calls).toMatchSnapshot();
    });

    it('should call external `onRef` if it has been passed in', () => {
      const mockOnRef = jest.fn();

      global.ResizeObserver = jest.fn(() => ({
        observe: () => {}
      }));

      const EnhancedTarget = withResizeObserverProps(dummyCallbacks)(Target);

      mount(
        <EnhancedTarget onRef={mockOnRef}/>
      );

      expect(mockOnRef.mock.calls).toMatchSnapshot();
    });

    it('should unregister observer with DOM node on unmount', () => {
      const mockDisconnect = jest.fn();

      global.ResizeObserver = jest.fn(() => ({
        observe: () => {},
        disconnect: mockDisconnect
      }));

      const EnhancedTarget = withResizeObserverProps(dummyCallbacks)(Target);
      const wrapper = mount(
        <EnhancedTarget/>
      );

      wrapper.unmount();

      expect(mockDisconnect.mock.calls).toMatchSnapshot();
    });

    it('should invoke provided callback with observer state and not expect any return', () => {
      let observerCallback = null;

      global.ResizeObserver = jest.fn((callback) => {
        observerCallback = callback;

        return {
          observe: () => {}
        };
      });

      const mockStateCallback = jest.fn();
      const mockPropsCallback = jest.fn(() => mockStateCallback);
      const mockRender = jest.fn();
      const EnhancedTarget = compose(
        withResizeObserverProps(mockPropsCallback),
        (Component) => (props) => {
          mockRender(props);

          return (
            <Component {...props}/>
          );
        }
      )(Target);

      mount(
        <EnhancedTarget a={1} b={2}/>
      );

      observerCallback([ { contentRect: { width: 100, height: 200 } } ]);
      observerCallback([ { contentRect: { width: 200, height: 300 } } ]);
      expect(mockRender.mock.calls).toMatchSnapshot();
      expect(mockPropsCallback.mock.calls).toMatchSnapshot();
      expect(mockStateCallback.mock.calls).toMatchSnapshot();
    });

    it('should map observer state to props with shallow equal check', () => {
      let observerCallback = null;

      global.ResizeObserver = jest.fn((callback) => {
        observerCallback = callback;

        return {
          observe: () => {}
        };
      });

      const mockStateCallback = jest.fn((state) => state);
      const mockPropsCallback = jest.fn(() => mockStateCallback);
      const mockRender = jest.fn();
      const EnhancedTarget = compose(
        withResizeObserverProps(mockPropsCallback),
        (Component) => (props) => {
          mockRender(props);

          return (
            <Component {...props}/>
          );
        }
      )(Target);

      mount(
        <EnhancedTarget a={1} b={2}/>
      );

      observerCallback([ { contentRect: { width: 100, height: 200 } } ]);
      observerCallback([ { contentRect: { width: 200, height: 300 } } ]);
      observerCallback([ { contentRect: { width: 200, height: 300 } } ]);
      expect(mockRender.mock.calls).toMatchSnapshot();
      expect(mockPropsCallback.mock.calls).toMatchSnapshot();
      expect(mockStateCallback.mock.calls).toMatchSnapshot();
    });

    describe('display name', () => {
      let origNodeEnv = null;

      beforeAll(() => {
        origNodeEnv = process.env.NODE_ENV;
      });

      afterAll(() => {
        process.env.NODE_ENV = origNodeEnv;
      });

      it('should wrap display name in non-production env', () => {
        process.env.NODE_ENV = 'test';

        const EnhancedTarget = withResizeObserverProps(dummyCallbacks)(Target);
        const wrapper = mount(
          <EnhancedTarget/>
        );

        expect(wrapper).toMatchSnapshot();
      });

      it('should not wrap display name in production env', () => {
        process.env.NODE_ENV = 'production';

        const EnhancedTarget = withResizeObserverProps(dummyCallbacks)(Target);
        const wrapper = mount(
          <EnhancedTarget/>
        );

        expect(wrapper).toMatchSnapshot();
      });
    });
  });

  describe('Resize Observer API is not supported', () => {
    const Target = () => null;
    let withResizeObserverProps = null;

    beforeEach(() => {
      jest.resetModules();

      withResizeObserverProps = require('../src/').default;
    });

    it('should just pass Target component through', () => {
      const EnhancedTarget = withResizeObserverProps(dummyCallbacks)(Target);
      const wrapper = mount(
        <EnhancedTarget a={1} b={2}/>
      );

      expect(wrapper).toMatchSnapshot();
    });
  });
});