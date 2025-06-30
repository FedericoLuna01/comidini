import { HandPlatterIcon } from 'lucide-react'

export const Logo = () => {
  return (
    <div className='flex items-center justify-center flex-row gap-2'>
      <div
        className='bg-gradient-to-r from-orange-400 to-rose-400 rounded-md p-2'
      >
        <HandPlatterIcon className='size-6 text-white' />
      </div>
      <h1 className='text-3xl uppercase font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400'>
        Comidini
      </h1>
    </div>
  )
}
