import BreadCrumbs from '@/components/single-product/BreadCrumbs';
import { fetchSingleProduct,findExistingReview } from '@/utils/actions';
import Image from 'next/image';
import { formatCurrency } from '@/utils/format';
import FavoriteToggleButton from '@/components/products/FavoriteToggleButton';
import AddToCart from '@/components/single-product/AddToCart';
import ProductRating from '@/components/single-product/ProductRating';
import { notFound } from 'next/navigation';
import ShareButton from '@/components/single-product/SingleProduct';
import SubmitReview from '@/components/reviews/SubmitReview';
import ProductReviews from '@/components/reviews/ProductReviews';
import { auth } from '@clerk/nextjs/server';


type ProductPageProps = {
  params: Promise<{ id?: string }>; // 👈 params is a Promise in your setup
};

export default async function SingleProductPage({ params }: ProductPageProps) {
  const { id } = await params; // ✅ Await the Promise
  if (!id) return notFound();

  const product = await fetchSingleProduct(id);
  if (!product) return notFound();

  const { name, image, company, description, price } = product;
  const dollarsAmount = formatCurrency(price ?? 0);
  const { userId } = await auth();
  const reviewDoesNotExist =
    userId && !(await findExistingReview(userId, product.id));
  


  return (
    <section>
      <BreadCrumbs name={name} />
      <div className='mt-6 grid gap-y-8 lg:grid-cols-2 lg:gap-x-16'>
        {/* IMAGE FIRST COL */}
        <div className='relative h-[500px]'>
          <Image
            src={image}
            alt={name}
            fill
            sizes='(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw'
            priority
            className='rounded-md object-cover'
          />
        </div>

        {/* PRODUCT INFO SECOND COL */}
        <div>
          <div className='flex gap-x-8 items-center'>
            <h1 className='capitalize text-3xl font-bold'>{name}</h1>
            <div className='flex items-center gap-x-2'>
              <FavoriteToggleButton productId={id} />
              <ShareButton name={product.name}  productId={id}/>
            
            </div>
            
          </div>
          <ProductRating productId={id} />
          <h4 className='text-xl mt-2'>{company}</h4>
          <p className='mt-3 text-md bg-muted inline-block p-2 rounded-md'>
            {dollarsAmount}
          </p>
          <p className='mt-6 leading-8 text-muted-foreground'>{description}</p>
          <AddToCart productId={id} />
        </div>
      </div>
      <ProductReviews productId={id} />
    {reviewDoesNotExist && < SubmitReview productId={id} />}
    </section>
  );
}

