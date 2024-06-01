import { getUser} from '../utils/common';

const DictTag = props => {

    const tag = props.tag;
    const user = getUser();
    const dict = user && user.dict;
    
    if (dict && dict.hasOwnProperty(tag)) {
        return <>{dict[tag]}</>;
    }
    else {
        return <>{tag}</>;
    }

};

export default DictTag