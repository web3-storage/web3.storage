import Button from './button.js'

const crossStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><line x1='0' y1='0' x2='100' y2='100' stroke='black' vector-effect='non-scaling-stroke'/><line x1='0' y1='100' x2='100' y2='0' stroke='black' vector-effect='non-scaling-stroke'/></svg>\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: '100% 100%',
}

export default function Hero() {
  return (
    <div className="bg-white">
      <div className="flex items-center" style={{ height: 'calc(100vh - 150px)' }}>
        <div className="center mw9 tc">
          <hgroup className="black">
            <h1 className="f4 f2-m f1-ns fw4 mv3">Welcome to Web3 Storage</h1>
          </hgroup>
          <div className="mt3 mb4">
            <Button
              wrapperClassName="mh3 mb3"
              href="#getting-started"
              id="getting-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
