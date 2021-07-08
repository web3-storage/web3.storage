import Button from './button.js'

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
