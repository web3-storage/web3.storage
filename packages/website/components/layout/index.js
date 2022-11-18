import React from 'react';
import clsx from 'clsx';

import GradientBackground from '../gradientbackground/gradientbackground';
import TextBlock from '../textblock/textblock';

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.variant]
 * @param {string} [props.id]
 *
 * @returns
 */
export function Sectionals({ children, variant, id }) {
  return (
    <div className="sectionals" id={id}>
      {variant && <GradientBackground variant={variant} />}

      {children}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.id]
 * @param {string} [props.className]
 *
 * @returns
 */
export function Sectional({ children, id, className }) {
  return (
    <section id={id} className="sectional">
      <div className={clsx(className)}>{children}</div>
    </section>
  );
}

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.pushLeft]
 * @param {string} [props.pushRight]
 *
 * @returns
 */
export function Column({ children, className, pushLeft, pushRight }) {
  return (
    <div className={clsx(className)} data-push-left={pushLeft} data-push-right={pushRight}>
      <div className="column-content">{children}</div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {Object} props.textBlock
 * @param {React.ReactNode} props.header
 *
 * @returns
 */
export function Hero({ id, textBlock, header }) {
  return (
    <div id={`${id}_hero-container`}>
      <div className={`${id}_hero-top-section`}>
        <div className={`${id}_hero-artwork-container`}>{header}</div>

        <TextBlock block={textBlock} />
      </div>
    </div>
  );
}
