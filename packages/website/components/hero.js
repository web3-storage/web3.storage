import Button from './button.js'

export default function Hero() {
  return (
    <div className="bg-white">
      <div className="flex items-center" style={{ height: 'calc(100vh - 168px)' }}>
        <div className="mx-auto max-w-screen-2xl text-center">
          <hgroup className="text-black mb-14">
            <h1 className="mb-14">Distributed Storage Made Simple</h1>
            <h2 className="typography-hero-subtitle mb-5">The Easiest Way to Build on Web3</h2>
            <p>Powered by IPFS & Filecoin</p>
          </hgroup>
          <Button
            href="#getting-started"
            id="getting-started"
            wrapperClassName="flex mx-auto w-48"
          >
            Start Here
          </Button>
        </div>
      </div>
    </div>
  )
}
