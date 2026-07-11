import { Wordmark, HeroMock } from "./Brand";

// Branded left panel shared by login + signup.
export function AuthSide() {
  return (
    <div className="auth-side">
      <div className="glow glow-a" />
      <div className="auth-side-inner">
        <Wordmark />
        <h2>Real-time analytics for every app you ship.</h2>
        <p>
          Visitors, pageviews, devices and campaigns — streaming live from a
          single script tag.
        </p>
        <div className="auth-mock">
          <HeroMock />
        </div>
      </div>
    </div>
  );
}
